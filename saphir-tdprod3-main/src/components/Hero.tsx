import { motion } from "framer-motion";
import { memo } from "react";
import heroImage from "@/assets/hero-spa.jpg";

interface HeroProps {
  onBookClick: () => void;
}

const Hero = ({ onBookClick }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Ken Burns Effect */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 ken-burns">
          <img
            src={heroImage}
            alt="SAPHIR Spa Luxury Interior"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
      </div>

      {/* Floating Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[100px] animate-glow" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Subtle backdrop for readability */}
        <div className="absolute inset-0 -m-8 rounded-3xl bg-gradient-to-b from-background/40 via-background/20 to-background/40 backdrop-blur-[2px]" />
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6 relative"
        >
          <span className="inline-block px-4 py-2 text-sm font-semibold text-primary border border-primary/30 rounded-full backdrop-blur-sm bg-background/30">
            ✨ Centre de Bien-Être de Luxe
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold mb-8 leading-tight text-white relative"
          style={{ textShadow: '0 4px 20px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)' }}
        >
          Redéfinir le Temps.
          <br />
          <span className="text-rose-gold">Votre Sanctuaire</span>
          <br />
          de Sérénité vous Attend.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-12 font-medium relative"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}
        >
          Évadez-vous dans un univers où chaque instant est dédié à votre bien-être.
          Massages exclusifs, soins signature et rituels ancestraux.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button onClick={onBookClick} className="btn-primary text-lg group">
            <span className="relative z-10 flex items-center gap-2">
              Réserver un instant de paix
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
          <a href="#soins" className="glass-button text-lg">
            Découvrir nos soins
          </a>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-primary rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default memo(Hero);
