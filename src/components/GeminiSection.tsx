import { motion } from "framer-motion";
import { Sparkles, Code, PieChart, FileText, MessageSquare } from "lucide-react";

const geminiCapabilities = [
  {
    icon: Code,
    title: "Geração de SQL",
    description: "Descreva em português o que você precisa e a IA gera o SQL perfeito."
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

        <div className="grid lg:grid-cols-2 gap-12 items-center">
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
                  <p className="text-sm mb-3">Aqui está a análise de vendas por região:</p>
                  <div className="bg-white/5 rounded-lg p-3 mb-3">
                    <code className="text-xs text-electric-blue-light font-mono">
                      SELECT region, SUM(amount)<br/>
                      FROM sales<br/>
                      WHERE date {'>'} NOW() - INTERVAL '3 months'<br/>
                      GROUP BY region
                    </code>
                  </div>
                  <p className="text-sm text-white/70">
                    📊 Sudeste lidera com R$ 2.5M (+15%)<br/>
                    📈 Sul teve maior crescimento: +23%
                  </p>
                </div>
              </div>

              {/* User Follow-up */}
              <div className="flex justify-end">
                <div className="bg-electric-blue text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%]">
                  <p className="text-sm">Gere um gráfico comparativo</p>
                </div>
              </div>

              {/* Typing Indicator */}
              <div className="flex justify-start">
                <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <motion.div 
                      className="w-2 h-2 bg-electric-blue rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div 
                      className="w-2 h-2 bg-electric-blue rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div 
                      className="w-2 h-2 bg-electric-blue rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
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
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
