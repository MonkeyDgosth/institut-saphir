-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can check availability" ON public.reservations;
DROP POLICY IF EXISTS "Anyone can create reservations" ON public.reservations;

-- Policy: Anyone can create reservations (public booking - kept for functionality)
CREATE POLICY "Anyone can create reservations"
ON public.reservations
FOR INSERT
WITH CHECK (true);

-- Policy: Only authenticated users can view reservations (protects PII)
CREATE POLICY "Authenticated users can view reservations"
ON public.reservations
FOR SELECT
TO authenticated
USING (true);

-- Policy: Only authenticated users can update reservations
CREATE POLICY "Authenticated users can update reservations"
ON public.reservations
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Only authenticated users can delete reservations
CREATE POLICY "Authenticated users can delete reservations"
ON public.reservations
FOR DELETE
TO authenticated
USING (true);