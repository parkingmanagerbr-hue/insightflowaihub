import { motion } from "framer-motion";
import {
  Cpu, Code, PieChart, FileText, MessageSquare,
  Play, Download, Lock, Zap, Settings2, Globe, Table
} from "lucide-react";

const ollamaCapabilities = [
  {
    icon: Code,
    title: "Geração de SQL",
    description: "Descreva em português e o Ollama gera SQL otimizado localmente, sem enviar dados à nuvem."
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
    description: "Identificação automática de padrões, tendências e anomalias nos seus dados."
  },
  {
    icon: Lock,
    title: "100% Privado",
    description: "Seus dados nunca saem da sua máquina. IA local via Ollama — sem API keys externas."
  },
  {
    icon: Settings2,
    title: "Multi-Modelo",
    description: "Escolha entre Llama 3, Mistral, CodeLlama, Phi-3 e qualquer modelo Ollama."
  },
  {
    icon: MessageSquare,
    title: "Conversa Contínua",
    description: "Chat analítico com memória de contexto para iterações mais precisas."
  },
  {
    icon: Zap,
    title: "Sem Latência de Rede",
    description: "Respostas mais rápidas pois a IA roda diretamente na sua CPU/GPU local."
  },
  {
    icon: Globe,
    title: "Funciona Offline",
    description: "Trabalhe sem internet — o Ollama roda completamente na sua máquina."
  },
  {
    icon: FileText,
    title: "Resumo Executivo",
    description: "Relatórios resumidos e prontos para apresentações gerados localmente."
  },
  {
    icon: Cpu,
    title: "GPU Acelerado",
    description: "Aproveite sua GPU NVIDIA/AMD para inferência ultrarrápida com Ollama."
  },
];

const OllamaSection = () => {
  return (
    <section id="ollama" className="py-24 relative overflow-hidden">
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
            <Cpu className="w-4 h-4 text-electric-blue animate-pulse" />
            <span className="text-sm font-medium text-white/90">Powered by Ollama — IA Local</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Inteligência Artificial <span className="gradient-text">sem Nuvem</span>
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Toda a potência de LLMs modernos rodando na sua máquina — privado, rápido e sem custo por token
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
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-electric-blue/20 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-electric-blue" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Ollama Chat</h4>
                  <p className="text-white/50 text-sm">llama3 — rodando localmente</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400">Online</span>
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
                  <p className="text-sm mb-3">Aqui está a query SQL gerada localmente pelo Ollama:</p>
                  <div className="bg-white/5 rounded-lg p-3 mb-3">
                    <code className="text-xs text-electric-blue-light font-mono">
                      SELECT region, SUM(amount) as total<br />
                      FROM sales<br />
                      WHERE date {'>'} NOW() - INTERVAL '3 months'<br />
                      GROUP BY region<br />
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
                    <span className="text-green-400">✓ 4 registros em 87ms</span>
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

              {/* Model selector hint */}
              <div className="flex justify-center">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
                  <Settings2 className="w-3 h-3" />
                  Troque o modelo nas Configurações
                </div>
              </div>
            </div>
          </motion.div>

          {/* Capabilities grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ollamaCapabilities.map((cap, index) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex items-start gap-3 p-4 rounded-xl glass-dark border border-white/10"
              >
                <div className="w-9 h-9 rounded-lg bg-electric-blue/20 flex items-center justify-center flex-shrink-0">
                  <cap.icon className="w-4 h-4 text-electric-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-0.5">{cap.title}</h3>
                  <p className="text-white/60 text-xs leading-relaxed">{cap.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl glass-dark border border-white/10">
            <div className="text-left">
              <p className="text-white font-medium mb-1">Pronto para começar?</p>
              <p className="text-white/60 text-sm">
                Instale o Ollama, baixe um modelo e conecte ao InsightFlow
              </p>
            </div>
            <a
              href="https://ollama.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-electric-blue hover:bg-electric-blue/90 text-white text-sm font-semibold transition-colors"
            >
              Baixar Ollama
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OllamaSection;
