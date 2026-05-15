import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Database, Sparkles, FileText, BarChart3, History, Clock,
  Upload, Users, FileCode, MessageSquare, TrendingUp, Zap, Globe,
  Download, Shield, Play, Key, Table, RefreshCw
} from "lucide-react";

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Database, titleKey: "multiDb", descKey: "multiDb" },
    { icon: Sparkles, titleKey: "sqlAI", descKey: "sqlAI" },
    { icon: Play, titleKey: "execute", descKey: "execute" },
    { icon: BarChart3, titleKey: "powerBI", descKey: "powerBI" },
    { icon: History, titleKey: "history", descKey: "history" },
    { icon: Table, titleKey: "savedResults", descKey: "savedResults" },
    { icon: Download, titleKey: "exportResults", descKey: "exportResults" },
    { icon: Key, titleKey: "encryption", descKey: "encryption" },
    { icon: FileText, titleKey: "reports", descKey: "reports" },
    { icon: Shield, titleKey: "secureQueries", descKey: "secureQueries" },
    { icon: MessageSquare, titleKey: "analyticsChat", descKey: "analyticsChat" },
    { icon: RefreshCw, titleKey: "rerun", descKey: "rerun" },
    { icon: Users, titleKey: "multiTenant", descKey: "multiTenant" },
    { icon: TrendingUp, titleKey: "kpis", descKey: "kpis" },
    { icon: Zap, titleKey: "performance", descKey: "performance" },
    { icon: Globe, titleKey: "api", descKey: "api" },
  ];

  return (
    <section id="funcionalidades" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("landing.features.title")}{" "}
            <span className="gradient-text">{t("landing.features.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("landing.features.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.03 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {t(`landing.features.items.${feature.titleKey}.title`)}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t(`landing.features.items.${feature.descKey}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
