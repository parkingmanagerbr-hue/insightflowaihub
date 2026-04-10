import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";

const navLinks = [
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#seguranca", label: "Segurança" },
  { href: "#pwa", label: "PWA" },
  { href: "#auth", label: "Auth" },
  { href: "#gemini", label: "Gemini" },
  { href: "#contato", label: "Contato" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-[hsl(216,82%,15%,0.95)] backdrop-blur-xl shadow-lg border-b border-white/10" 
          : "bg-[hsl(216,82%,15%,0.5)] backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <MobileMenu />
          </div>

          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button 
              asChild
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <a href="/plans">Planos</a>
            </Button>
            <Button 
              asChild
              className="bg-[hsl(210,100%,56%)] hover:bg-[hsl(210,100%,65%)] text-white"
            >
              <a href="/auth">Entrar</a>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
