import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Gift, Download, Sparkles } from "lucide-react";

const GiftCard = () => {
  const [amount, setAmount] = useState(50000);
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const amounts = [25000, 50000, 75000, 100000, 150000];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price);
  };

  const generateCard = () => {
    if (recipientName && senderName) {
      setIsGenerated(true);
    }
  };

  const downloadCard = () => {
    // In a real app, this would generate a PDF or image
    alert("Carte cadeau générée ! Dans une version complète, un PDF serait téléchargé.");
  };

  return (
    <section id="cadeau" className="py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: isMobile ? 0.4 : 0.8 }}
          className="text-center mb-16 relative"
        >
          {/* Backdrop for readability */}
          <div className="absolute inset-0 -m-4 rounded-2xl bg-background/30 backdrop-blur-[3px]" />
          
          <span className="inline-block px-4 py-2 text-sm font-semibold text-primary border border-primary/30 rounded-full mb-6 relative bg-background/40 backdrop-blur-sm">
            <Gift className="inline-block w-4 h-4 mr-2" />
            Offrir l'Évasion
          </span>
          <h2 
            className="font-display text-4xl md:text-5xl lg:text-6xl mb-6 font-semibold text-white relative"
            style={{ textShadow: '0 4px 16px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4)' }}
          >
            Carte Cadeau <span className="text-rose-gold">SAPHIR</span>
          </h2>
          <p 
            className="text-white/80 max-w-2xl mx-auto text-lg font-medium relative"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
          >
            Offrez un moment de pur bonheur à vos proches avec nos cartes cadeaux personnalisées.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: isMobile ? 0.4 : 0.8 }}
            className="glass-card p-8"
          >
            <h3 className="font-display text-2xl mb-6">Personnalisez votre carte</h3>

            {/* Amount Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Montant</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {amounts.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      amount === a
                        ? "bg-gradient-rose text-background"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {formatPrice(a)}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Pour</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Nom du destinataire"
                className="input-elegant"
              />
            </div>

            {/* Sender Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">De la part de</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Votre nom"
                className="input-elegant"
              />
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Message personnel (optionnel)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Un petit mot pour accompagner votre cadeau..."
                rows={3}
                className="input-elegant resize-none"
              />
            </div>

            <button
              onClick={generateCard}
              disabled={!recipientName || !senderName}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles size={18} />
              Générer la carte
            </button>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: isMobile ? 0.4 : 0.8 }}
            className="flex items-center justify-center"
          >
            <div className="relative w-full max-w-md aspect-[3/2]">
              {/* Card Design */}
              <div className="glass-card p-8 h-full flex flex-col justify-between bg-gradient-to-br from-background via-secondary/30 to-background overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />

                {/* Header */}
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-rose flex items-center justify-center">
                      <Sparkles size={14} className="text-background" />
                    </div>
                    <span className="font-display text-xl">SAPHIR</span>
                  </div>
                  <h4 className="text-2xl font-display text-rose-gold">Carte Cadeau</h4>
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-2">
                  {recipientName && (
                    <p className="text-sm text-muted-foreground">
                      Pour <span className="text-foreground font-medium">{recipientName}</span>
                    </p>
                  )}
                  {message && (
                    <p className="text-xs text-muted-foreground italic line-clamp-2">"{message}"</p>
                  )}
                </div>

                {/* Footer */}
                <div className="relative z-10 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Valeur</p>
                    <p className="font-display text-3xl text-primary">
                      {formatPrice(amount)} <span className="text-lg">FCFA</span>
                    </p>
                  </div>
                  {senderName && (
                    <p className="text-sm text-muted-foreground">
                      De <span className="text-foreground">{senderName}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Download Button */}
              {isGenerated && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: isMobile ? 0.2 : 0.3 }}
                  onClick={downloadCard}
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 btn-primary flex items-center gap-2 text-sm py-3 px-6"
                >
                  <Download size={16} />
                  Télécharger
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GiftCard;
