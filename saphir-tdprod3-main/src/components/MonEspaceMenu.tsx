import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Diamond, Clock, History, ChevronRight, Sparkles, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Reservation {
  id: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_price: number;
}

const statusProgress: Record<string, { step: number; label: string; color: string }> = {
  en_attente: { step: 0, label: "En attente", color: "bg-amber-500" },
  confirme: { step: 1, label: "Confirmé", color: "bg-blue-500" },
  preparation: { step: 2, label: "Préparation", color: "bg-purple-500" },
  soin_en_cours: { step: 3, label: "Soin en cours", color: "bg-rose-500" },
  termine: { step: 4, label: "Terminé", color: "bg-emerald-500" },
};

const MonEspaceMenu = () => {
  const [activeTab, setActiveTab] = useState<"suivi" | "historique">("suivi");
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null);
  const [history, setHistory] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .order("booking_date", { ascending: false })
        .order("booking_time", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Réservation en cours (pas terminée ni annulée)
        const active = data.find(r => !["termine", "annule"].includes(r.status));
        setCurrentReservation(active || null);
        
        // Historique (terminées)
        const pastReservations = data.filter(r => r.status === "termine");
        setHistory(pastReservations.slice(0, 5));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des réservations");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="btn-primary text-sm py-2 px-6 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform">
          <Diamond size={16} />
          Mon Espace
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0 bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl overflow-hidden"
      >
        {/* Tabs */}
        <div className="flex border-b border-border/30">
          <button
            onClick={() => setActiveTab("suivi")}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              activeTab === "suivi"
                ? "text-primary bg-primary/10 border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <Clock size={16} />
            Suivi en Direct
          </button>
          <button
            onClick={() => setActiveTab("historique")}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              activeTab === "historique"
                ? "text-primary bg-primary/10 border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <History size={16} />
            Historique
          </button>
        </div>

        {/* Content */}
        <div className="p-4 min-h-[200px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-[180px]"
              >
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </motion.div>
            ) : activeTab === "suivi" ? (
              <motion.div
                key="suivi"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {currentReservation ? (
                  <div className="space-y-4">
                    {/* Service Info */}
                    <div className="bg-white/5 rounded-xl p-4 border border-border/30">
                      <p className="text-xs text-muted-foreground mb-1">Soin en cours</p>
                      <p className="font-display text-lg text-foreground">
                        {currentReservation.service_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(currentReservation.booking_date)} à {currentReservation.booking_time}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground">
                        Statut: {statusProgress[currentReservation.status]?.label || "En attente"}
                      </p>
                      <div className="relative">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${((statusProgress[currentReservation.status]?.step || 0) / 4) * 100}%` 
                            }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full"
                          />
                        </div>
                        {/* Progress Steps */}
                        <div className="flex justify-between mt-2">
                          {["Attente", "Confirmé", "Prépa", "Soin", "Fini"].map((step, idx) => (
                            <div 
                              key={step}
                              className={`text-[10px] ${
                                idx <= (statusProgress[currentReservation.status]?.step || 0)
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Diamond className="w-12 h-12 mx-auto mb-3 text-primary/30" />
                    <p className="text-muted-foreground text-sm">
                      Aucune réservation en cours
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Réservez un soin pour suivre son avancement
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="historique"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {history.length > 0 ? (
                  <div className="space-y-2">
                    {history.map((reservation) => (
                      <motion.div
                        key={reservation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border/30 hover:bg-white/10 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle size={14} className="text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {reservation.service_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(reservation.booking_date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">
                            {formatPrice(reservation.total_price)} F
                          </p>
                          <ChevronRight size={14} className="text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 mx-auto mb-3 text-primary/30" />
                    <p className="text-muted-foreground text-sm">
                      Aucun soin passé
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Votre historique apparaîtra ici
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MonEspaceMenu;
