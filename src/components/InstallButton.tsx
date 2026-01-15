import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Check, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallButtonProps {
  variant?: "default" | "hero";
  className?: string;
}

const InstallButton = ({ variant = "default", className = "" }: InstallButtonProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowButton(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Show button after a delay even without prompt (for iOS and other browsers)
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
      setShowButton(false);
    } else {
      // For iOS and browsers that don't support beforeinstallprompt
      alert(
        "Para instalar o InsightFlow:\n\n" +
        "iPhone/iPad: Toque no botão de compartilhar e selecione 'Adicionar à Tela de Início'\n\n" +
        "Android/Chrome: Toque no menu (⋮) e selecione 'Instalar aplicativo'"
      );
    }
  };

  if (variant === "hero") {
    return (
      <AnimatePresence>
        {(showButton || isInstalled) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              onClick={handleInstall}
              disabled={isInstalled}
              size="lg"
              className={`gap-3 px-8 py-6 text-lg font-semibold rounded-xl ${
                isInstalled 
                  ? "bg-green-600/20 text-green-400 border border-green-500/30" 
                  : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/30"
              } ${className}`}
            >
              {isInstalled ? (
                <>
                  <Check className="w-5 h-5" />
                  App Instalado
                </>
              ) : (
                <>
                  <Smartphone className="w-5 h-5" />
                  Instalar App
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {(showButton || isInstalled) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <Button
            onClick={handleInstall}
            disabled={isInstalled}
            variant={isInstalled ? "secondary" : "default"}
            className={`gap-2 ${
              isInstalled 
                ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" 
                : "bg-primary hover:bg-primary/90"
            } ${className}`}
          >
            {isInstalled ? (
              <>
                <Check className="w-4 h-4" />
                Instalado
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Instalar App
              </>
            )}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallButton;