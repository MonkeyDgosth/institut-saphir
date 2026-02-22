import { motion } from "framer-motion";
import { useState, memo, useEffect } from "react";
import { services, categories } from "@/data/services";
import ServiceCard from "./ServiceCard";
import { Service } from "@/data/services";

interface ServicesSectionProps {
  onSelectService: (service: Service) => void;
}

const ServicesSection = ({ onSelectService }: ServicesSectionProps) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const filteredServices =
    activeCategory === "all"
      ? services
      : services.filter((s) => s.category === activeCategory);

  return (
    <section id="soins" className="py-24 px-6 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: isMobile ? 0.4 : 0.8 }}
          className="text-center mb-16 relative"
        >
          {/* Backdrop for readability */}
          <div className="absolute inset-0 -m-4 rounded-2xl bg-background/30 md:backdrop-blur-[3px]" />
          
          <span className="inline-block px-4 py-2 text-sm font-semibold text-primary border border-primary/30 rounded-full mb-6 relative bg-background/40 backdrop-blur-sm">
            Nos Prestations
          </span>
          <h2 
            className="font-display text-4xl md:text-5xl lg:text-6xl mb-6 font-semibold text-white relative"
            style={{ textShadow: '0 4px 16px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4)' }}
          >
            Nos Rituels <span className="text-rose-gold">Signatures</span>
          </h2>
          <p 
            className="text-white/80 max-w-2xl mx-auto text-lg font-medium relative"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
          >
            Découvrez notre collection de soins d'exception, conçus pour éveiller vos sens
            et restaurer votre harmonie intérieure.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: isMobile ? 0.3 : 0.6, delay: isMobile ? 0 : 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? "bg-gradient-rose text-background shadow-lg shadow-primary/30"
                  : "glass-card hover:bg-white/10"
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              onClick={() => onSelectService(service)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(ServicesSection);
