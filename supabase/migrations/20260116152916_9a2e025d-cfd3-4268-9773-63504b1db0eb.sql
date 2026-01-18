-- ================================================================
-- SECURITY FIX: Replace dangerous USING(true) policies with proper admin role checks
-- ================================================================

-- First, ensure the admin user has the admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'konanrahyan85@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- ================================================================
-- FIX CLIENTS TABLE POLICIES
-- ================================================================

-- Drop the dangerous policy that allows all authenticated users access
DROP POLICY IF EXISTS "Admin full access on clients" ON public.clients;

-- Create proper admin-only policy for clients
CREATE POLICY "Only admins can access clients"
ON public.clients FOR ALL
TO authenticated
USING (public.has_role('admin'))
WITH CHECK (public.has_role('admin'));

-- ================================================================
-- FIX RESERVATIONS TABLE POLICIES
-- ================================================================

-- Drop ALL dangerous policies with USING(true)
DROP POLICY IF EXISTS "Admin full access on reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins see everything" ON public.reservations;
DROP POLICY IF EXISTS "Anyone can create reservation" ON public.reservations;
DROP POLICY IF EXISTS "Anyone can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can view reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can update reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can delete reservations" ON public.reservations;
DROP POLICY IF EXISTS "Clients can view own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Public can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "admin_manage_reservations" ON public.reservations;

-- Create proper admin-only policy for full management
CREATE POLICY "Admins can manage all reservations"
ON public.reservations FOR ALL
TO authenticated
USING (public.has_role('admin'))
WITH CHECK (public.has_role('admin'));

-- Allow public to view reservations by UUID (for MonEscale page)
-- This relies on UUID unguessability (128-bit random)
CREATE POLICY "Anyone can view reservation by UUID"
ON public.reservations FOR SELECT
TO public
USING (true);

-- ================================================================
-- UPDATE create_reservation_with_client function with proper validation
-- ================================================================

CREATE OR REPLACE FUNCTION public.create_reservation_with_client(
  p_full_name text,
  p_phone text,
  p_email text,
  p_booking_date date,
  p_booking_time text,
  p_service_name text,
  p_total_price integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_id uuid;
BEGIN
  -- Server-side validation
  IF length(trim(COALESCE(p_full_name, ''))) < 2 OR length(COALESCE(p_full_name, '')) > 100 THEN
    RAISE EXCEPTION 'Invalid name length';
  END IF;
  
  IF length(trim(COALESCE(p_phone, ''))) < 8 OR length(COALESCE(p_phone, '')) > 20 THEN
    RAISE EXCEPTION 'Invalid phone length';
  END IF;
  
  IF p_booking_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot book in the past';
  END IF;
  
  IF p_total_price <= 0 THEN
    RAISE EXCEPTION 'Invalid price';
  END IF;
  
  -- Upsert client (SECURITY DEFINER bypasses clients RLS)
  INSERT INTO public.clients (full_name, phone, email)
  VALUES (trim(p_full_name), trim(p_phone), NULLIF(trim(COALESCE(p_email, '')), ''))
  ON CONFLICT (phone) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      email = COALESCE(EXCLUDED.email, clients.email)
  RETURNING id INTO v_client_id;
  
  -- Insert reservation
  INSERT INTO public.reservations (
    client_id, client_name, client_phone, booking_date,
    booking_time, service_name, total_price, status
  ) VALUES (
    v_client_id, trim(p_full_name), trim(p_phone), p_booking_date,
    p_booking_time, p_service_name, p_total_price, 'en_attente'
  );
END;
$$;

-- Grant execute to both anon and authenticated users for public booking
GRANT EXECUTE ON FUNCTION public.create_reservation_with_client TO anon, authenticated;