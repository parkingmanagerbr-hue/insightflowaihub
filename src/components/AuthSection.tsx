import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { UserCheck, Mail, Shield, Key, UserPlus, Lock } from "lucide-react";

const AuthSection = () => {
  const { t } = useTranslation();

  const authFeatures = [
    { icon: UserPlus, key: "secureRegister" },
    { icon: Lock, key: "protectedLogin" },
    { icon: Key, key: "passwordRecovery" },
    { icon: UserCheck, key: "manualApproval" },
    { icon: Mail, key: "emailNotifications" },
    { icon: Shield, key: "routeProtection" },
  ];

  return (
    <section id="auth" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t("landing.authSection.title")}{" "}
              <span className="gradient-text">{t("landing.authSection.titleHighlight")}</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              {t("landing.authSection.subtitle")}
            </p>

            <div className="space-y-4">
              {authFeatures.map((feature, index) => (
                <motion.div
                  key={feature.key}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      {t(`landing.authSection.items.${feature.key}.title`)}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {t(`landing.authSection.items.${feature.key}.desc`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
              <h3 className="text-xl font-semibold mb-6 text-center">
                {t("landing.authSection.flowTitle")}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">1</div>
                  <div className="flex-1 p-4 rounded-lg bg-secondary">
                    <p className="font-medium">{t("landing.authSection.step1")}</p>
                    <p className="text-sm text-muted-foreground">{t("landing.authSection.step1Status")}</p>
                  </div>
                </div>
                <div className="flex justify-center"><div className="w-0.5 h-8 bg-border" /></div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">2</div>
                  <div className="flex-1 p-4 rounded-lg bg-secondary">
                    <p className="font-medium">{t("landing.authSection.step2")}</p>
                    <p className="text-sm text-muted-foreground">{t("landing.authSection.step2Status")}</p>
                  </div>
                </div>
                <div className="flex justify-center"><div className="w-0.5 h-8 bg-border" /></div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">3</div>
                  <div className="flex-1 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="font-medium text-green-700">{t("landing.authSection.step3")}</p>
                    <p className="text-sm text-green-600">{t("landing.authSection.step3Status")}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AuthSection;
