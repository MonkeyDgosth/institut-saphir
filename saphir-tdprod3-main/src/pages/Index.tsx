import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServicesSection from "@/components/ServicesSection";
import BookingModal from "@/components/BookingModal";
import ParallaxGallery from "@/components/ParallaxGallery";
import GiftCard from "@/components/GiftCard";
import Footer from "@/components/Footer";
import BlurMasks from "@/components/BlurMasks";
import SplineBackground from "@/components/SplineBackground";
import { Service, services } from "@/data/services";

const Index = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détection du mobile pour optimiser les performances (Spline)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setTimeout(() => setSelectedService(null), 300);
  };

  const handleHeroBookClick = () => {
    // Ouvre le premier service par défaut
    setSelectedService(services[0]);
    setIsBookingOpen(true);
  };

  return (
    // 1. overflow-x-hidden : Empêche le site de bouger de gauche à droite sur mobile
    // 2. bg-[#050505] : Couleur de fond de sécurité si le Spline met du temps à charger
    // 3. touch-pan-y : Optimise le scroll vertical sur iPhone/Android
    <div className="min-h-screen w-full relative overflow-x-hidden bg-[#050505] text-white selection:bg-[#D4AF37]/30 touch-pan-y">
      
      {/* Spline 3D Background */}
      {/* Astuce Pro : On cache le Spline sur les très petits mobiles si besoin de perf, 
          sinon on le laisse en fixed pour qu'il ne bouge pas quand on scroll */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <SplineBackground />
      </div>
      
      {/* Blur Masks (Effets de lumière) */}
      <div className="relative z-10 pointer-events-none">
        <BlurMasks />
      </div>

      {/* Header (Z-Index élevé pour rester au dessus) */}
      <div className="relative z-50">
        <Header />
      </div>

      {/* Main Content */}
      {/* relative z-20 : Pour passer au-dessus du fond 3D */}
      <main className="relative z-20 flex flex-col gap-0">
        
        {/* Sections */}
        <Hero onBookClick={handleHeroBookClick} />
        
        {/* On ajoute un peu d'espace responsive entre les sections si nécessaire dans les composants eux-mêmes */}
        <ServicesSection onSelectService={handleSelectService} />
        <ParallaxGallery />
        <GiftCard />
      </main>

      {/* Footer */}
      <div className="relative z-20">
        <Footer />
      </div>

      {/* Booking Modal (Toujours au top niveau) */}
      <AnimatePresence mode="wait">
        {selectedService && (
          <BookingModal
            service={selectedService}
            isOpen={isBookingOpen}
            onClose={handleCloseBooking}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;