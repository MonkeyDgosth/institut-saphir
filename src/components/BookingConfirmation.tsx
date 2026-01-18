import { motion } from "framer-motion";
import { CheckCircle, Sparkles, MessageCircle, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface BookingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    serviceName: string;
    date: Date;
    time: string;
    clientName: string;
    total: number;
  };
  onWhatsApp: () => void;
}

const BookingConfirmation = ({
  isOpen,
  onClose,
  booking,
  onWhatsApp,
}: BookingConfirmationProps) => {
  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.5, type: "spring" }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-md p-8 text-center relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-rose" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Success animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative mb-6"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-rose flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-background" />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display text-3xl mb-2"
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
        >
          Réservation Confirmée
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-6"
        >
          Merci pour votre confiance, {booking.clientName}
        </motion.p>

        {/* Booking summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 rounded-2xl p-4 mb-6 text-left"
        >
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prestation</span>
              <span className="font-medium">{booking.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{format(booking.date, "EEEE d MMMM yyyy", { locale: fr })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Heure</span>
              <span>{booking.time}</span>
            </div>
            <div className="h-px bg-border/50 my-2" />
            <div className="flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-display text-primary text-lg">
                {formatPrice(booking.total)} FCFA
              </span>
            </div>
          </div>
        </motion.div>

        {/* WhatsApp button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onWhatsApp}
          className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
        >
          <MessageCircle size={18} />
          Envoyer via WhatsApp
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-muted-foreground"
        >
          Un récapitulatif vous sera envoyé par WhatsApp
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default BookingConfirmation;
