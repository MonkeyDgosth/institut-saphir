import { motion } from "framer-motion";
import { memo, useEffect, useState } from "react";
import heroImage from "@/assets/hero-spa.jpg";

interface HeroProps {
  onBookClick: () => void;
}

const Hero = ({ onBookClick }: HeroProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const animDuration = isMobile ? 0.5 : 0.8;
  const animDelay = isMobile ? 0.1 : 0.2;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Ken Burns Effect - disabled on mobile */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 ${!isMobile ? 'ken-burns' : ''}`}>
          <img
            src={heroImage}
            alt="SAPHIR Spa Luxury Interior"
            className="w-full h-full object-cover"
            fetchPriority="high"
          />
        </div>
        {/* Gradient Overlay - reduced blur on mobile */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
      </div>

      {/* Floating Glow Effect - disable on mobile */}
      {!isMobile && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[100px] animate-glow" />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-center">
        {/* Subtle backdrop for readability */}
        <div className="absolute inset-0 -m-4 md:-m-8 rounded-3xl bg-gradient-to-b from-background/40 via-background/20 to-background/40 backdrop-blur-none md:backdrop-blur-[2px]" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: animDuration, delay: animDelay }}
          className="mb-4 md:mb-6 relative"
        >
          <span className="inline-block px-4 py-2 text-xs md:text-sm font-semibold text-primary border border-primary/30 rounded-full bg-background/30">
            ✨ Centre de Bien-Être
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: animDuration, delay: animDelay + 0.1 }}
          className="font-display text-3xl md:text-5xl lg:text-7xl font-semibold mb-4 md:mb-8 leading-tight text-white relative"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}
        >
          Redéfinir le Temps.
          <br />
          <span className="text-rose-gold">Votre Sanctuaire</span>
          <br />
          vous Attend.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: animDuration, delay: animDelay + 0.2 }}
          className="text-sm md:text-lg text-white/90 max-w-2xl mx-auto mb-6 md:mb-12 font-medium relative"
          style={{ textShadow: '0 1px 5px rgba(0,0,0,0.6)' }}
        >
          Évadez-vous dans un univers dédié à votre bien-être.
          Massages exclusifs, soins signature et rituels.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: animDuration, delay: animDelay + 0.3 }}
          className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center"
        >
          <button onClick={onBookClick} className="btn-primary text-sm md:text-lg group">
            <span className="relative z-10 flex items-center gap-2">
              Réserver
              <svg className="w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
          <a href="#soins" className="glass-button text-sm md:text-lg">
            Découvrir
          </a>
        </motion.div>
      </div>

      {/* Scroll Indicator - disabled on mobile */}
      {!isMobile && (
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
      )}
    </section>
  );
};

export default memo(Hero);

export default memo(Hero);
