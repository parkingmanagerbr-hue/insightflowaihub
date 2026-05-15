import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Check, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const PlansSection = () => {
  const { t } = useTranslation();

  const plans = [
    {
      id: "monthly",
      icon: Zap,
      price: "R$ 99",
      popular: false,
      nameKey: "landing.plans.monthly.name",
      periodKey: "landing.plans.monthly.period",
      featuresKey: "landing.plans.monthly.features",
    },
    {
      id: "annual",
      icon: Crown,
      price: "R$ 990",
      popular: true,
      nameKey: "landing.plans.annual.name",
      periodKey: "landing.plans.annual.period",
      featuresKey: "landing.plans.annual.features",
    },
  ];

  return (
    <section id="planos" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4">{t("landing.plans.badge")}</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("landing.plans.title")}{" "}
            <span className="gradient-text">{t("landing.plans.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("landing.plans.subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => {
            const features = t(plan.featuresKey, { returnObjects: true }) as string[];
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`relative rounded-2xl border-2 p-8 transition-all hover:scale-[1.02] ${
                  plan.popular
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border bg-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      {t("landing.plans.mostPopular")}
                    </Badge>
                  </div>
                )}
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <plan.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{t(plan.nameKey)}</h3>
                  <div>
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{t(plan.periodKey)}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {Array.isArray(features) && features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`w-full h-12 ${
                    plan.popular ? "" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  <Link to="/plans">{t("landing.plans.subscribe")}</Link>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PlansSection;
