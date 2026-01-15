import { motion } from "framer-motion";
import { 
  Database, Sparkles, FileText, BarChart3, History, Clock, 
  Upload, Users, FileCode, MessageSquare, TrendingUp, Zap, Globe 
} from "lucide-react";

const features = [
  {
    icon: Database,
    title: "Conexão com Banco de Dados",
    description: "Conecte-se a PostgreSQL, MySQL, SQL Server, Oracle e mais."
  },
  {
    icon: Sparkles,
    title: "SQL Automático com Gemini",
    description: "Descreva o que precisa em linguagem natural, IA gera o SQL."
  },
  {
    icon: FileText,
    title: "Relatórios Inteligentes",
    description: "Criação automática de relatórios baseada nos seus dados."
  },
  {
    icon: BarChart3,
    title: "Power BI Embedded",
    description: "Visualize dashboards interativos diretamente no sistema."
  },
  {
    icon: History,
    title: "Histórico de Relatórios",
    description: "Acesse, reutilize e compare relatórios anteriores."
  },
  {
    icon: Clock,
    title: "Agendamento Automático",
    description: "Programe relatórios para serem gerados periodicamente."
  },
  {
    icon: Upload,
    title: "Upload de CSV/Excel",
    description: "Importe planilhas para análise rápida com IA."
  },
  {
    icon: Users,
    title: "Multi-tenant",
    description: "Cada organização com seus próprios dados e usuários."
  },
  {
    icon: FileCode,
    title: "Templates Prontos",
    description: "Comece rapidamente com templates pré-configurados."
  },
  {
    icon: MessageSquare,
    title: "Chat Analítico",
    description: "Converse com seus dados usando linguagem natural."
  },
  {
    icon: TrendingUp,
    title: "KPIs Automáticos",
    description: "Identificação automática de métricas relevantes."
  },
  {
    icon: Zap,
    title: "Cache Inteligente",
    description: "Respostas rápidas com cache otimizado por IA."
  },
  {
    icon: Globe,
    title: "API Pública",
    description: "Integre o InsightFlow com outros sistemas via API."
  },
];

const FeaturesSection = () => {
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
            Funcionalidades <span className="gradient-text">Completas</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tudo que você precisa para transformar dados em insights acionáveis
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
