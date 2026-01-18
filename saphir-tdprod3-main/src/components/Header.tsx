import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import MonEspaceMenu from "./MonEspaceMenu";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass-card px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-rose flex items-center justify-center">
              <svg
                className="w-6 h-6 text-background"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 3c-1.5 2-3 4-3 6.5C9 12 10.5 13 12 13s3-1 3-3.5c0-2.5-1.5-4.5-3-6.5zm0 0c1.5 2 3 4 3 6.5 0 2.5-1.5 3.5-3 3.5m0 0v7.5m-4.5 0h9"
                />
              </svg>
            </div>
            <span className="font-display text-2xl tracking-wide font-semibold text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>SAPHIR</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#soins" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Nos Soins
            </a>
            <a href="#galerie" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Galerie
            </a>
            <a href="#cadeau" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Carte Cadeau
            </a>
            <MonEspaceMenu />
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-2 glass-card p-6 flex flex-col gap-4"
          >
            <a href="#soins" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
              Nos Soins
            </a>
            <a href="#galerie" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
              Galerie
            </a>
            <a href="#cadeau" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
              Carte Cadeau
            </a>
            <MonEspaceMenu />
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
