import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Sparkles,
  User,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const MonEspace = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pour l'instant, redirection simple
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl mb-4 text-rose-gold">
            Mon Espace SAPHIR
          </h1>
          <p className="text-muted-foreground">
            Suivez vos réservations et profitez de vos avantages
          </p>
        </div>

        <div className="glass-card p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-2xl mb-4">Bienvenue</h2>
          <p className="text-muted-foreground mb-6">
            Pour accéder à votre espace personnel, entrez le code reçu par SMS lors de votre réservation.
          </p>
          <button
            onClick={() => navigate("/")}
            className="btn-primary inline-flex items-center gap-2"
          >
            Retour à l'accueil
            <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MonEspace;
