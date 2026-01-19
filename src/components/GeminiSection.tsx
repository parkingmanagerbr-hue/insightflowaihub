import { motion } from "framer-motion";
import { 
  Sparkles, Code, PieChart, FileText, MessageSquare, 
  Play, Download, Database, Table 
} from "lucide-react";

const geminiCapabilities = [
  {
    icon: Code,
    title: "Geração de SQL",
    description: "Descreva em português o que você precisa e a IA gera o SQL perfeito."
  },
  {
    icon: Play,
    title: "Execução Direta",
    description: "Execute a query gerada diretamente no seu banco de dados conectado."
  },
  {
    icon: Table,
    title: "Visualização de Resultados",
    description: "Veja os resultados em tabela com preview de até 100 registros."
  },
  {
    icon: Download,
    title: "Exportação Flexível",
    description: "Exporte resultados para CSV, Excel ou JSON instantaneamente."
  },
  {
    icon: PieChart,
    title: "Análise de Dados",
    description: "Identificação automática de padrões, tendências e anomalias."
  },
  {
    icon: Sparkles,
    title: "Sugestão de Visualizações",
    description: "A IA recomenda os melhores gráficos para seus dados."
  },
  {
    icon: FileText,
    title: "Resumo Executivo",
    description: "Relatórios resumidos prontos para apresentações."
  },
  {
    icon: MessageSquare,
    title: "Conversa Contínua",
    description: "Chat analítico que lembra o contexto da conversa."
  },
];

const GeminiSection = () => {
  return (
    <section id="gemini" className="py-24 relative overflow-hidden">
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
            <Sparkles className="w-4 h-4 text-electric-blue animate-pulse" />
            <span className="text-sm font-medium text-white/90">Powered by Gemini AI</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Inteligência Artificial <span className="gradient-text">de Ponta</span>
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Transforme linguagem natural em insights poderosos com Gemini
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Chat Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-deep-blue/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-electric-blue/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-electric-blue" />
              </div>
              <div>
                <h4 className="text-white font-medium">Chat Analítico</h4>
                <p className="text-white/50 text-sm">Converse com seus dados</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-electric-blue text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%]">
                  <p className="text-sm">Quero ver as vendas dos últimos 3 meses por região</p>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start">
                <div className="bg-white/10 text-white px-4 py-3 rounded-2xl rounded-tl-sm max-w-[85%]">
                  <p className="text-sm mb-3">Aqui está a query SQL para sua solicitação:</p>
                  <div className="bg-white/5 rounded-lg p-3 mb-3">
                    <code className="text-xs text-electric-blue-light font-mono">
                      SELECT region, SUM(amount) as total<br/>
                      FROM sales<br/>
                      WHERE date {'>'} NOW() - INTERVAL '3 months'<br/>
                      GROUP BY region<br/>
                      ORDER BY total DESC
                    </code>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-electric-blue/20 text-electric-blue text-xs hover:bg-electric-blue/30 transition-colors">
                      <Play className="w-3 h-3" />
                      Executar
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 text-white/70 text-xs hover:bg-white/20 transition-colors">
                      <Download className="w-3 h-3" />
                      Exportar
                    </button>
                  </div>
                </div>
              </div>

              {/* Result Preview */}
              <div className="flex justify-start">
                <div className="bg-white/10 text-white px-4 py-3 rounded-2xl rounded-tl-sm max-w-[90%]">
                  <p className="text-sm mb-2 flex items-center gap-2">
                    <Table className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">✓ 4 registros em 125ms</span>
                  </p>
                  <div className="bg-white/5 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-white/10">
                        <tr>
                          <th className="px-3 py-1.5 text-left">Região</th>
                          <th className="px-3 py-1.5 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-white/5">
                          <td className="px-3 py-1.5">Sudeste</td>
                          <td className="px-3 py-1.5 text-right text-green-400">R$ 2.5M</td>
                        </tr>
                        <tr className="border-t border-white/5">
                          <td className="px-3 py-1.5">Sul</td>
                          <td className="px-3 py-1.5 text-right text-green-400">R$ 1.8M</td>
                        </tr>
                        <tr className="border-t border-white/5">
                          <td className="px-3 py-1.5">Nordeste</td>
                          <td className="px-3 py-1.5 text-right text-green-400">R$ 1.2M</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Capabilities */}
          <div className="space-y-4">
            {geminiCapabilities.map((cap, index) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="flex items-start gap-4 p-4 rounded-xl glass-dark border border-white/10"
              >
                <div className="w-10 h-10 rounded-lg bg-electric-blue/20 flex items-center justify-center flex-shrink-0">
                  <cap.icon className="w-5 h-5 text-electric-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{cap.title}</h3>
                  <p className="text-white/60 text-sm">{cap.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GeminiSection;
