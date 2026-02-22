import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, memo, useEffect, useState } from "react";
import massageImg from "@/assets/massage.jpg";
import facialImg from "@/assets/facial.jpg";
import hammamImg from "@/assets/hammam.jpg";
import signatureImg from "@/assets/signature.jpg";
import heroImg from "@/assets/hero-spa.jpg";

const images = [
  { src: heroImg, alt: "Spa SAPHIR Interior" },
  { src: massageImg, alt: "Massage Therapy" },
  { src: facialImg, alt: "Facial Treatment" },
  { src: hammamImg, alt: "Hammam Ritual" },
  { src: signatureImg, alt: "Signature Experience" },
];

const ParallaxGallery = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Disable parallax on mobile
  const y1 = isMobile ? motion.custom(0) : useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = isMobile ? motion.custom(0) : useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y3 = isMobile ? motion.custom(0) : useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <section id="galerie" ref={containerRef} className="py-16 md:py-24 px-4 md:px-6 relative overflow-hidden">
      {/* Background Glow - disable on mobile */}
      {!isMobile && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[200px]" />
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: isMobile ? 0.4 : 0.8 }}
          className="text-center mb-8 md:mb-16 relative"
        >
          {/* Backdrop for readability - simplified on mobile */}
          <div className="absolute inset-0 -m-2 md:-m-4 rounded-2xl bg-background/30 backdrop-blur-none md:backdrop-blur-[3px]" />
          
          <span className="inline-block px-4 py-2 text-xs md:text-sm font-semibold text-primary border border-primary/30 rounded-full mb-3 md:mb-6 relative bg-background/40">
            Notre Univers
          </span>
          <h2 
            className="font-display text-3xl md:text-5xl lg:text-6xl mb-3 md:mb-6 font-semibold text-white relative"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
          >
            Un Havre de <span className="text-rose-gold">Paix</span>
          </h2>
          <p 
            className="text-white/80 max-w-2xl mx-auto text-lg font-medium relative"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
          >
            Plongez dans l'atmosphère unique de SAPHIR à travers notre galerie immersive.
          </p>
        </motion.div>

        {/* Parallax Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[800px]">
          {/* Column 1 */}
          <motion.div style={{ y: y1 }} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="glass-card overflow-hidden h-[350px]"
            >
              <img
                src={images[0].src}
                alt={images[0].alt}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="glass-card overflow-hidden h-[300px]"
            >
              <img
                src={images[1].src}
                alt={images[1].alt}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>

          {/* Column 2 */}
          <motion.div style={{ y: y2 }} className="space-y-6 pt-20">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-card overflow-hidden h-[400px]"
            >
              <img
                src={images[2].src}
                alt={images[2].alt}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="glass-card overflow-hidden h-[280px]"
            >
              <img
                src={images[3].src}
                alt={images[3].alt}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>

          {/* Column 3 */}
          <motion.div style={{ y: y3 }} className="space-y-6 pt-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="glass-card overflow-hidden h-[320px]"
            >
              <img
                src={images[4].src}
                alt={images[4].alt}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="glass-card p-8 h-[250px] flex flex-col justify-center text-center"
            >
              <h3 
                className="font-display text-2xl mb-3 text-rose-gold font-semibold"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
              >
                Vivez l'Expérience
              </h3>
              <p 
                className="text-white/80 text-sm font-medium"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
              >
                Chaque détail a été pensé pour votre bien-être absolu.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default memo(ParallaxGallery);
