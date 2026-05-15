import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Menu, X, LayoutDashboard, FileText, History, Settings, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface MobileMenuProps {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
}

const MobileMenu = ({ isAuthenticated = false, isAdmin = false, onLogout }: MobileMenuProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: t("mobile.dashboard"), href: "/dashboard" },
    { icon: <FileText className="w-5 h-5" />, label: t("mobile.generateReport"), href: "/reports/new" },
    { icon: <History className="w-5 h-5" />, label: t("mobile.history"), href: "/history" },
    { icon: <Settings className="w-5 h-5" />, label: t("mobile.settings"), href: "/settings" },
    { icon: <Shield className="w-5 h-5" />, label: t("mobile.administration"), href: "/admin", adminOnly: true },
  ];

  const filteredItems = menuItems.filter((item: any) => !item.adminOnly || isAdmin);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative z-50 text-foreground hover:bg-primary/10"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? t("mobile.closeMenu") : t("mobile.openMenu")}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Menu className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 bg-deep-blue/50 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed top-0 left-0 h-full w-72 bg-card shadow-xl z-50 flex flex-col">
              <div className="p-6 border-b border-border">
                <Logo size="md" />
              </div>
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {isAuthenticated ? (
                  filteredItems.map((item, index) => (
                    <motion.a key={item.href} href={item.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-colors group" onClick={() => setIsOpen(false)}>
                      <span className="text-muted-foreground group-hover:text-primary transition-colors">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </motion.a>
                  ))
                ) : (
                  <>
                    <a href="#funcionalidades" className="block px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors" onClick={() => setIsOpen(false)}>{t("mobile.features")}</a>
                    <a href="#seguranca" className="block px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors" onClick={() => setIsOpen(false)}>{t("mobile.security")}</a>
                    <a href="#pwa" className="block px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors" onClick={() => setIsOpen(false)}>PWA</a>
                    <a href="#auth" className="block px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors" onClick={() => setIsOpen(false)}>{t("mobile.authentication")}</a>
                    <a href="#gemini" className="block px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors" onClick={() => setIsOpen(false)}>{t("mobile.gemini")}</a>
                    <a href="#contato" className="block px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors" onClick={() => setIsOpen(false)}>{t("mobile.contact")}</a>
                  </>
                )}
              </nav>
              <div className="p-4 border-t border-border space-y-3">
                <LanguageSwitcher />
                {isAuthenticated && (
                  <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { onLogout?.(); setIsOpen(false); }}>
                    <LogOut className="w-5 h-5" />
                    <span>{t("mobile.logout")}</span>
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileMenu;
