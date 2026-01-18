import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle,
  XCircle,
  ArrowLeft,
  MapPin,
  Phone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Reservation = Tables<"reservations">;

const statusInfo: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  en_attente: { icon: Clock, color: "text-yellow-400", label: "En attente de confirmation" },
  confirme: { icon: CheckCircle, color: "text-green-400", label: "Confirmé" },
  annule: { icon: XCircle, color: "text-red-400", label: "Annulé" },
};

const MonEscale = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      fetchReservation();
    }
  }, [id]);

  const fetchReservation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setNotFound(true);
        return;
      }

      setReservation(data);
    } catch (error) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Chargement de votre réservation...</p>
        </div>
      </div>
    );
  }

  if (notFound || !reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center glass-card p-8 max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="font-display text-2xl mb-2">Réservation introuvable</h1>
          <p className="text-muted-foreground mb-6">
            Cette réservation n'existe pas ou a été supprimée.
          </p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Retour à l'accueil
          </button>
        </motion.div>
      </div>
    );
  }

  const status = statusInfo[reservation.status] || statusInfo.en_attente;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          Retour à l'accueil
        </button>

        <div className="glass-card overflow-hidden">
          {/* Header avec statut */}
          <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-8 h-8 ${status.color}`} />
              <div>
                <h1 className="font-display text-2xl">Votre Réservation</h1>
                <p className={`text-sm ${status.color}`}>{status.label}</p>
              </div>
            </div>
          </div>

          {/* Détails */}
          <div className="p-6 space-y-6">
            {/* Service */}
            <div>
              <h2 className="font-display text-xl text-primary mb-2">
                {reservation.service_name}
              </h2>
              <p className="text-2xl font-display">
                {formatPrice(reservation.total_price)} <span className="text-sm text-muted-foreground">FCFA</span>
              </p>
            </div>

            {/* Date & Heure */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(reservation.booking_date), "d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Heure</p>
                  <p className="font-medium">{reservation.booking_time}</p>
                </div>
              </div>
            </div>

            {/* Infos pratiques */}
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <h3 className="font-display text-lg mb-3">Informations pratiques</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>SAPHIR Spa - Dakar, Sénégal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+221 XX XXX XX XX</span>
                </div>
              </div>
            </div>

            {/* Message selon statut */}
            {reservation.status === "en_attente" && (
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-300">
                  ⏳ Votre réservation est en cours de validation. Vous recevrez une confirmation par SMS.
                </p>
              </div>
            )}

            {reservation.status === "confirme" && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-300">
                  ✨ Votre réservation est confirmée ! Nous avons hâte de vous accueillir.
                </p>
              </div>
            )}

            {reservation.status === "annule" && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-300">
                  Cette réservation a été annulée. Contactez-nous pour plus d'informations.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MonEscale;
