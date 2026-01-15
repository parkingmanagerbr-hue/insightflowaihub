import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Sparkles, 
  Play, 
  Copy, 
  Download,
  FileSpreadsheet,
  Table2,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const Reports = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Atenção',
        description: 'Digite uma descrição para gerar o relatório',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedSQL(`-- Relatório gerado automaticamente
SELECT 
  DATE_TRUNC('month', created_at) AS mes,
  COUNT(*) AS total_vendas,
  SUM(valor) AS receita_total,
  AVG(valor) AS ticket_medio
FROM vendas
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes DESC;`);
      setIsGenerating(false);
      toast({
        title: 'SQL Gerado!',
        description: 'O código SQL foi gerado com sucesso',
      });
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSQL);
    toast({
      title: 'Copiado!',
      description: 'SQL copiado para a área de transferência',
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Gerador de Relatórios com IA
            </CardTitle>
            <CardDescription>
              Descreva o relatório que você precisa e a IA irá gerar o SQL automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Conexão com Banco</Label>
              <Select defaultValue="default">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conexão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Banco Principal
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descreva o relatório desejado</Label>
              <Textarea
                placeholder="Ex: Quero um relatório de vendas dos últimos 12 meses, agrupado por mês, mostrando total de vendas, receita e ticket médio"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar SQL
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {generatedSQL && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>SQL Gerado</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                  <Button size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Executar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
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
              Use templates prontos para acelerar a criação de relatórios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sales">
              <TabsList className="mb-4">
                <TabsTrigger value="sales">Vendas</TabsTrigger>
                <TabsTrigger value="financial">Financeiro</TabsTrigger>
                <TabsTrigger value="customers">Clientes</TabsTrigger>
              </TabsList>

              <TabsContent value="sales" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: BarChart3, name: 'Vendas Mensais', desc: 'Análise de vendas por período' },
                    { icon: Table2, name: 'Top Produtos', desc: 'Produtos mais vendidos' },
                    { icon: FileSpreadsheet, name: 'Comissões', desc: 'Relatório de comissões' },
                    { icon: Download, name: 'Exportação', desc: 'Dados para exportação' },
                  ].map((template) => (
                    <button
                      key={template.name}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <template.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">{template.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="financial">
                <p className="text-muted-foreground">Templates financeiros em breve...</p>
              </TabsContent>

              <TabsContent value="customers">
                <p className="text-muted-foreground">Templates de clientes em breve...</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Reports;
