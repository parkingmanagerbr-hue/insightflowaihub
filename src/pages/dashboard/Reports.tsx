import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Play,
  Copy,
  Download,
  FileSpreadsheet,
  Table2,
  BarChart3,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useOllama } from '@/hooks/useOllama';
import { generateSQL } from '@/services/ollamaService';
import OllamaStatus from '@/components/OllamaStatus';

const TEMPLATES = {
  sales: [
    {
      icon: BarChart3,
      name: 'Vendas Mensais',
      desc: 'Análise de vendas por período',
      prompt: 'Gere um relatório de vendas mensais agrupado por mês, mostrando total de vendas, receita bruta e ticket médio dos últimos 12 meses.',
    },
    {
      icon: Table2,
      name: 'Top Produtos',
      desc: 'Produtos mais vendidos',
      prompt: 'Liste os 20 produtos mais vendidos do último trimestre com quantidade, receita e margem percentual.',
    },
    {
      icon: FileSpreadsheet,
      name: 'Comissões',
      desc: 'Relatório de comissões por vendedor',
      prompt: 'Calcule as comissões de cada vendedor no mês atual com base nas vendas realizadas, mostrando total de vendas, percentual de comissão e valor a pagar.',
    },
    {
      icon: Download,
      name: 'Funil de Vendas',
      desc: 'Taxa de conversão por etapa',
      prompt: 'Mostre o funil de vendas com quantidade de leads, oportunidades, propostas e fechamentos por mês nos últimos 6 meses, incluindo taxa de conversão.',
    },
  ],
  financial: [
    {
      icon: BarChart3,
      name: 'DRE Simplificado',
      desc: 'Demonstrativo de resultado',
      prompt: 'Gere um DRE simplificado com receita bruta, deduções, receita líquida, custos, despesas e lucro líquido dos últimos 3 meses.',
    },
    {
      icon: Table2,
      name: 'Fluxo de Caixa',
      desc: 'Entradas e saídas por dia',
      prompt: 'Relatório de fluxo de caixa diário do mês atual mostrando saldo inicial, entradas, saídas e saldo final por dia.',
    },
  ],
  customers: [
    {
      icon: BarChart3,
      name: 'Retenção de Clientes',
      desc: 'Taxa de churn e retenção',
      prompt: 'Calcule a taxa de retenção e churn mensal de clientes nos últimos 12 meses, incluindo novos clientes, cancelamentos e base ativa.',
    },
    {
      icon: Table2,
      name: 'Segmentação RFM',
      desc: 'Recência, frequência e valor',
      prompt: 'Segmente clientes por RFM (Recência, Frequência, Valor Monetário) classificando em campeões, fiéis, em risco e perdidos.',
    },
  ],
};

const Reports = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { selectedModel, status: ollamaStatus } = useOllama();

  const handleGenerate = async (customPrompt?: string) => {
    const text = customPrompt || prompt.trim();
    if (!text) {
      toast({ title: 'Atenção', description: 'Digite uma descrição para gerar o relatório', variant: 'destructive' });
      return;
    }

    if (!ollamaStatus.connected) {
      toast({ title: 'Ollama offline', description: 'Inicie o Ollama com "ollama serve"', variant: 'destructive' });
      return;
    }

    if (customPrompt) setPrompt(customPrompt);
    setIsGenerating(true);
    setGeneratedSQL('');

    try {
      const result = await generateSQL(text, selectedModel);
      // Extract SQL from code block if present
      const match = result.match(/```sql\n?([\s\S]*?)```/i) || result.match(/```\n?([\s\S]*?)```/);
      const sql = match ? match[1].trim() : result.trim();
      setGeneratedSQL(sql);

      toast({ title: 'SQL Gerado!', description: `Query gerada pelo Ollama (${selectedModel})` });
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao gerar SQL',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSQL);
    toast({ title: 'Copiado!', description: 'SQL copiado para a área de transferência' });
  };

  const handleDownload = () => {
    const blob = new Blob([generatedSQL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-primary" />
                  Gerador de Relatórios com Ollama
                </CardTitle>
                <CardDescription>
                  Descreva o relatório e o Ollama gera o SQL localmente — sem enviar dados à nuvem
                </CardDescription>
              </div>
              <OllamaStatus showModel />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!ollamaStatus.connected && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ollama está offline. Execute <code className="font-mono bg-muted px-1 rounded">ollama serve</code> no terminal e recarregue a página.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Descreva o relatório desejado</Label>
              <Textarea
                placeholder="Ex: Quero um relatório de vendas dos últimos 12 meses, agrupado por mês, mostrando total de vendas, receita e ticket médio"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                disabled={!ollamaStatus.connected}
              />
            </div>

            <Button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !ollamaStatus.connected}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando com Ollama...
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4 mr-2" />
                  Gerar SQL
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {generatedSQL && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>SQL Gerado</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    .sql
                  </Button>
                  <Button size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Executar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm max-h-[400px]">
                <code>{generatedSQL}</code>
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Templates de Relatórios</CardTitle>
            <CardDescription>
              Use templates prontos — o Ollama gera o SQL automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sales">
              <TabsList className="mb-4">
                <TabsTrigger value="sales">Vendas</TabsTrigger>
                <TabsTrigger value="financial">Financeiro</TabsTrigger>
                <TabsTrigger value="customers">Clientes</TabsTrigger>
              </TabsList>

              {(['sales', 'financial', 'customers'] as const).map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {TEMPLATES[tab].map((template) => (
                      <button
                        key={template.name}
                        onClick={() => handleGenerate(template.prompt)}
                        disabled={isGenerating || !ollamaStatus.connected}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                          <template.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground">{template.desc}</p>
                        </div>
                        {isGenerating && prompt === template.prompt && (
                          <Loader2 className="w-4 h-4 animate-spin ml-auto text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Reports;
