import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
const Footer = () => {
  return <footer className="py-16 px-6 border-t border-border/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-rose flex items-center justify-center">
                <svg className="w-6 h-6 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c-1.5 2-3 4-3 6.5C9 12 10.5 13 12 13s3-1 3-3.5c0-2.5-1.5-4.5-3-6.5zm0 0c1.5 2 3 4 3 6.5 0 2.5-1.5 3.5-3 3.5m0 0v7.5m-4.5 0h9" />
                </svg>
              </div>
              <span className="font-display text-2xl">SAPHIR</span>
            </div>
            <p className="text-muted-foreground max-w-md mb-6">
              Votre sanctuaire de bien-être au cœur d'Abidjan. 
              Évadez-vous dans un univers de luxe et de sérénité.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/mrbeast" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:scale-110 transition-all"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://www.facebook.com/MrBeast6000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:scale-110 transition-all"
              >
                <Facebook size={18} />
              </a>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.1
        }}>
            <h4 className="font-display text-lg mb-4 text-rose-gold">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-primary" />
                <span>Zone 4, Marcory<br />Abidjan, Côte d'Ivoire</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-primary" />
                <a href="tel:+2250143250653" className="hover:text-foreground transition-colors">
                  +225 01 43 25 06 53
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-primary" />
                <a href="mailto:contact@saphir-spa.ci" className="hover:text-foreground transition-colors">
                  contact@saphir-spa.ci
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Hours */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.2
        }}>
            <h4 className="font-display text-lg mb-4 text-rose-gold">Horaires</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex justify-between">
                <span>Lundi - Vendredi</span>
                <span>09h - 20h</span>
              </li>
              <li className="flex justify-between">
                <span>Samedi</span>
                <span>10h - 19h</span>
              </li>
              <li className="flex justify-between">
                <span>Dimanche</span>
                <span>10h - 17h</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/30 text-center text-sm text-muted-foreground">
          <p>© 2026 SAPHIR Spa & Bien-Être. TryxDigital.ci</p>
        </div>
      </div>
    </footer>;
};
export default Footer;