import { motion } from "framer-motion";
import { UserCheck, Mail, Shield, Key, UserPlus, Lock } from "lucide-react";

const authFeatures = [
  {
    icon: UserPlus,
    title: "Registro Seguro",
    description: "Cadastro com email e senha com validação completa."
  },
  {
    icon: Lock,
    title: "Login Protegido",
    description: "Autenticação com tokens JWT e refresh automático."
  },
  {
    icon: Key,
    title: "Recuperação de Senha",
    description: "Fluxo nativo de recuperação via email."
  },
  {
    icon: UserCheck,
    title: "Aprovação Manual",
    description: "Novos usuários são aprovados por administradores."
  },
  {
    icon: Mail,
    title: "Notificações por Email",
    description: "Emails automáticos de aprovação e rejeição."
  },
  {
    icon: Shield,
    title: "Proteção de Rotas",
    description: "Middleware que valida JWT e status do usuário."
  },
];

const AuthSection = () => {
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
              Autenticação <span className="gradient-text">Robusta</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Sistema completo de autenticação com aprovação manual de usuários, 
              garantindo que apenas pessoas autorizadas acessem a plataforma.
            </p>

            <div className="space-y-4">
              {authFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
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
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
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
            {/* Auth Flow Diagram */}
            <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
              <h3 className="text-xl font-semibold mb-6 text-center">Fluxo de Aprovação</h3>
              
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    1
                  </div>
                  <div className="flex-1 p-4 rounded-lg bg-secondary">
                    <p className="font-medium">Usuário se registra</p>
                    <p className="text-sm text-muted-foreground">Status: pending_approval</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-8 bg-border" />
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    2
                  </div>
                  <div className="flex-1 p-4 rounded-lg bg-secondary">
                    <p className="font-medium">Admin recebe email</p>
                    <p className="text-sm text-muted-foreground">Com botões Aprovar/Rejeitar</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-8 bg-border" />
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div className="flex-1 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="font-medium text-green-700">Usuário aprovado</p>
                    <p className="text-sm text-green-600">Status: active - Email enviado</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Glow */}
            <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AuthSection;
