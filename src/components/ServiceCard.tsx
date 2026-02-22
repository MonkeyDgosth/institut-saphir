import { motion } from "framer-motion";
import { memo, useState, useEffect } from "react";
import { Clock, Sparkles } from "lucide-react";
import { Service } from "@/data/services";

interface ServiceCardProps {
  service: Service;
  index: number;
  onClick: () => void;
}

const ServiceCard = ({ service, index, onClick }: ServiceCardProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: isMobile ? 0.4 : 0.8, delay: index * (isMobile ? 0.05 : 0.1) }}
      className="group"
    >
      <div
        onClick={onClick}
        className="glass-card cursor-pointer h-full flex flex-col"
      >
        {/* Image */}
        <div className="relative h-56 overflow-hidden rounded-t-2xl">
          <img
            src={service.image}
            alt={service.name}
            className={`w-full h-full object-cover transition-transform ${isMobile ? 'duration-300' : 'duration-700'} group-hover:scale-110`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full backdrop-blur-sm border border-primary/20">
              {service.category === "massages" && "Massage"}
              {service.category === "visage" && "Visage"}
              {service.category === "hammam" && "Hammam"}
              {service.category === "signature" && "Signature"}
            </span>
          </div>

          {/* Price & Duration Overlay - Revealed on Hover */}
          <div className={`absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all ${isMobile ? 'duration-300' : 'duration-500'}`}>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-foreground/80">
                <Clock size={14} />
                {service.duration}
              </span>
              <span className="text-primary font-semibold">
                {formatPrice(service.price)} FCFA
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 
            className="font-display text-xl mb-2 group-hover:text-primary transition-colors font-semibold text-white"
            style={{ textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}
          >
            {service.name}
          </h3>
          <p 
            className="text-white/80 text-sm flex-1 line-clamp-2 font-medium"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
          >
            {service.description}
          </p>
          
          {/* CTA */}
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Personnalisable
            </span>
            <button className="flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2 transition-all">
              <Sparkles size={14} />
              Réserver
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(ServiceCard);
