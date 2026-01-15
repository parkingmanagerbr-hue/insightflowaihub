import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, FileText, History, Settings, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  adminOnly?: boolean;
}

interface MobileMenuProps {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
}

const menuItems: MenuItem[] = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", href: "/dashboard" },
  { icon: <FileText className="w-5 h-5" />, label: "Gerar Relatório", href: "/reports/new" },
  { icon: <History className="w-5 h-5" />, label: "Histórico", href: "/history" },
  { icon: <Settings className="w-5 h-5" />, label: "Configurações", href: "/settings" },
  { icon: <Shield className="w-5 h-5" />, label: "Administração", href: "/admin", adminOnly: true },
];

const MobileMenu = ({ isAuthenticated = false, isAdmin = false, onLogout }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative z-50 text-foreground hover:bg-primary/10"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-deep-blue/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-72 bg-card shadow-xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-border">
                <Logo size="md" />
              </div>

              <nav className="flex-1 p-4 space-y-1">
                {isAuthenticated ? (
                  filteredItems.map((item, index) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-colors group"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="text-muted-foreground group-hover:text-primary transition-colors">
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </motion.a>
                  ))
                ) : (
                  <>
                    <a
                      href="#funcionalidades"
                      className="block px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Funcionalidades
                    </a>
                    <a
                      href="#seguranca"
                      className="block px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Segurança
                    </a>
                    <a
                      href="#pwa"
                      className="block px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      PWA
                    </a>
                    <a
                      href="#auth"
                      className="block px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Autenticação
                    </a>
                    <a
                      href="#gemini"
                      className="block px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Gemini
                    </a>
                    <a
                      href="#contato"
                      className="block px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Contato
                    </a>
                  </>
                )}
              </nav>

              {isAuthenticated && (
                <div className="p-4 border-t border-border">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      onLogout?.();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sair</span>
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileMenu;
