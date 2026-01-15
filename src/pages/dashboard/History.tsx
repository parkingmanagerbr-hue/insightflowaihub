import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Copy, Search, Calendar, Database, Clock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface QueryHistory {
  id: string;
  prompt: string;
  generated_sql: string;
  context: string | null;
  model_used: string;
  execution_time_ms: number | null;
  created_at: string;
}

const History = () => {
  const [queries, setQueries] = useState<QueryHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuery, setSelectedQuery] = useState<QueryHistory | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('sql_query_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setQueries(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o histórico',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (sql: string) => {
    navigator.clipboard.writeText(sql);
    toast({
      title: 'Copiado!',
      description: 'SQL copiado para a área de transferência',
    });
  };

  const filteredQueries = queries.filter(q => 
    q.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.generated_sql.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-primary" />
            Histórico de Consultas SQL
          </h2>
          <p className="text-muted-foreground mt-1">
            Auditoria de todas as consultas SQL geradas pelo Gemini AI
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {queries.length} consultas
        </Badge>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por prompt ou SQL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Query List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="text-lg">Consultas Recentes</CardTitle>
              <CardDescription>
                Clique em uma consulta para ver os detalhes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[480px] pr-4">
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredQueries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <Database className="w-8 h-8 mb-2" />
                    <p>Nenhuma consulta encontrada</p>
                    <p className="text-sm mt-1">Gere consultas SQL na página de Relatórios</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredQueries.map((query) => (
                      <button
                        key={query.id}
                        onClick={() => setSelectedQuery(query)}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                          selectedQuery?.id === query.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{query.prompt}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(query.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                              {query.execution_time_ms && (
                                <>
                                  <Clock className="w-3 h-3 ml-2" />
                                  {query.execution_time_ms}ms
                                </>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="shrink-0 text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Gemini
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Query Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="text-lg">Detalhes da Consulta</CardTitle>
              <CardDescription>
                {selectedQuery 
                  ? format(new Date(selectedQuery.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
                  : 'Selecione uma consulta para ver detalhes'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedQuery ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Prompt</label>
                    <p className="mt-1 p-3 rounded-lg bg-muted text-sm">{selectedQuery.prompt}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-muted-foreground">SQL Gerado</label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCopy(selectedQuery.generated_sql)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copiar
                      </Button>
                    </div>
                    <ScrollArea className="h-[280px]">
                      <pre className="p-3 rounded-lg bg-muted text-sm overflow-x-auto">
                        <code>{selectedQuery.generated_sql}</code>
                      </pre>
                    </ScrollArea>
                  </div>

                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      {selectedQuery.model_used || 'Gemini'}
                    </div>
                    {selectedQuery.execution_time_ms && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {selectedQuery.execution_time_ms}ms
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                  <HistoryIcon className="w-12 h-12 mb-4" />
                  <p>Selecione uma consulta</p>
                  <p className="text-sm">para visualizar os detalhes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default History;
