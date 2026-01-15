import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallButton = () => {
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

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setShowButton(false);
  };

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
                : "bg-primary hover:bg-primary/90 electric-glow"
            }`}
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
