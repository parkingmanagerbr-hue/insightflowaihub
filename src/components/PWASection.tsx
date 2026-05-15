import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Smartphone, Wifi, WifiOff, Download, Layers, Monitor } from "lucide-react";

const PWASection = () => {
  const { t } = useTranslation();

  const pwaFeatures = [
    { icon: Download, key: "easyInstall" },
    { icon: WifiOff, key: "offline" },
    { icon: Layers, key: "splashScreen" },
    { icon: Smartphone, key: "mobileFirst" },
    { icon: Monitor, key: "desktopReady" },
    { icon: Wifi, key: "autoUpdate" },
  ];

  return (
    <section id="pwa" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
            <Smartphone className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{t("landing.pwa.badge")}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("landing.pwa.title")}{" "}
            <span className="gradient-text">{t("landing.pwa.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("landing.pwa.subtitle")}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative mx-auto"
          >
            <div className="relative w-64 h-[520px] bg-deep-blue rounded-[3rem] p-2 shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-deep-blue rounded-b-2xl z-10" />
              <div className="w-full h-full bg-gradient-to-b from-deep-blue/95 to-deep-blue rounded-[2.5rem] overflow-hidden">
                <div className="h-12 flex items-center justify-between px-6 pt-2">
                  <span className="text-white/60 text-xs">9:41</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-2 bg-white/60 rounded-sm" />
                    <div className="w-4 h-2 bg-white/60 rounded-sm" />
                    <div className="w-6 h-3 bg-green-400 rounded-sm" />
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-electric-blue flex items-center justify-center">
                      <span className="text-white font-bold">IF</span>
                    </div>
                    <span className="text-white font-semibold">InsightFlow</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-20 bg-white/10 rounded-xl p-3">
                      <div className="h-2 w-16 bg-white/30 rounded mb-2" />
                      <div className="h-4 w-24 bg-white/50 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-24 bg-white/10 rounded-xl" />
                      <div className="h-24 bg-white/10 rounded-xl" />
                    </div>
                    <div className="h-32 bg-white/10 rounded-xl p-3 flex items-end gap-2">
                      {[30, 50, 40, 70, 55].map((h, i) => (
                        <div key={i} className="flex-1 bg-electric-blue rounded-t" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-electric-blue/20 blur-3xl rounded-full -z-10" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pwaFeatures.map((feature, index) => (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{t(`landing.pwa.items.${feature.key}.title`)}</h3>
                <p className="text-muted-foreground text-sm">{t(`landing.pwa.items.${feature.key}.desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PWASection;
