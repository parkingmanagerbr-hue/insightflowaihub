import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Shield, Lock, Eye, FileWarning, Server, AlertTriangle } from "lucide-react";

const SecuritySection = () => {
  const { t } = useTranslation();

  const securityFeatures = [
    { icon: Shield, key: "sanitization" },
    { icon: Lock, key: "attackProtection" },
    { icon: Eye, key: "middleware" },
    { icon: FileWarning, key: "secureLogs" },
    { icon: Server, key: "rateLimiting" },
    { icon: AlertTriangle, key: "zeroExposure" },
  ];

  return (
    <section id="seguranca" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark mb-6">
            <Shield className="w-4 h-4 text-electric-blue" />
            <span className="text-sm font-medium text-white/90">{t("landing.security.badge")}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            {t("landing.security.title")}{" "}
            <span className="gradient-text">{t("landing.security.titleHighlight")}</span>
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            {t("landing.security.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl glass-dark border border-white/10 hover:border-electric-blue/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-electric-blue/20 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-electric-blue" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">
                {t(`landing.security.items.${feature.key}.title`)}
              </h3>
              <p className="text-white/60 text-sm">
                {t(`landing.security.items.${feature.key}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
