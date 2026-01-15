import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileWarning, Server, AlertTriangle } from "lucide-react";

const securityFeatures = [
  {
    icon: Shield,
    title: "Sanitização de Entradas",
    description: "Todas as entradas são validadas e sanitizadas para prevenir injeções maliciosas."
  },
  {
    icon: Lock,
    title: "Proteção contra Ataques",
    description: "Bloqueio de SQL injection, XSS e CSRF com múltiplas camadas de defesa."
  },
  {
    icon: Eye,
    title: "Middleware de Segurança",
    description: "Middleware dedicado remove dados sensíveis de qualquer resposta."
  },
  {
    icon: FileWarning,
    title: "Logs Seguros",
    description: "Logs não contêm informações confidenciais, credenciais ou stack traces."
  },
  {
    icon: Server,
    title: "Rate Limiting",
    description: "Proteção contra brute force e abuso com limites de requisições."
  },
  {
    icon: AlertTriangle,
    title: "Zero Exposição",
    description: "Nunca retornamos strings de conexão, credenciais ou SQL bruto."
  },
];

const SecuritySection = () => {
  return (
    <section id="seguranca" className="py-24 relative overflow-hidden">
      {/* Background */}
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
            <span className="text-sm font-medium text-white/90">Enterprise Security</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Segurança em <span className="gradient-text">Primeiro Lugar</span>
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Proteção completa dos seus dados com as melhores práticas de segurança
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl glass-dark border border-white/10 hover:border-electric-blue/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-electric-blue/20 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-electric-blue" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">{feature.title}</h3>
              <p className="text-white/60 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
