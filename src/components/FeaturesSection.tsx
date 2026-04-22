import { motion } from "framer-motion";
import { 
  Database, Sparkles, FileText, BarChart3, History, Clock, 
  Upload, Users, FileCode, MessageSquare, TrendingUp, Zap, Globe,
  Download, Shield, Play, Key, Table, RefreshCw
} from "lucide-react";

const features = [
  {
    icon: Database,
    title: "Conexão Multi-Banco",
    description: "PostgreSQL, MySQL, SQL Server, Oracle com criptografia segura de credenciais."
  },
  {
    icon: Sparkles,
    title: "SQL Automático com IA",
    description: "Descreva em linguagem natural, Ollama gera o SQL otimizado localmente."
  },
  {
    icon: Play,
    title: "Execução Direta",
    description: "Execute queries geradas diretamente no seu banco de dados."
  },
  {
    icon: BarChart3,
    title: "Power BI Embedded",
    description: "Visualize dashboards interativos diretamente no sistema."
  },
  {
    icon: History,
    title: "Histórico Completo",
    description: "Acesse todas as queries SQL geradas com opção de re-executar."
  },
  {
    icon: Table,
    title: "Resultados Salvos",
    description: "Histórico de execuções com preview dos resultados."
  },
  {
    icon: Download,
    title: "Exportar Resultados",
    description: "Exporte dados para CSV, Excel ou JSON com um clique."
  },
  {
    icon: Key,
    title: "Criptografia Segura",
    description: "Senhas criptografadas com AES-GCM e chave única por usuário."
  },
  {
    icon: FileText,
    title: "Relatórios Inteligentes",
    description: "Criação automática de relatórios baseada nos seus dados."
  },
  {
    icon: Shield,
    title: "Queries Seguras",
    description: "Apenas SELECT permitido, proteção contra SQL injection."
  },
  {
    icon: MessageSquare,
    title: "Chat Analítico",
    description: "Converse com a IA sobre dados, SQL e Power BI."
  },
  {
    icon: RefreshCw,
    title: "Re-executar Queries",
    description: "Re-execute qualquer query do histórico em segundos."
  },
  {
    icon: Users,
    title: "Multi-tenant",
    description: "Cada usuário com seus próprios dados e conexões."
  },
  {
    icon: TrendingUp,
    title: "KPIs Automáticos",
    description: "Identificação automática de métricas relevantes."
  },
  {
    icon: Zap,
    title: "Alta Performance",
    description: "Execução rápida com feedback em tempo real."
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
              transition={{ duration: 0.5, delay: index * 0.03 }}
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
