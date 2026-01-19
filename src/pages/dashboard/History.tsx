import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History as HistoryIcon, 
  Copy, 
  Search, 
  Calendar, 
  Database, 
  Clock, 
  Sparkles,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Table,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Download,
  FileSpreadsheet,
  FileJson
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useExportData } from '@/hooks/useExportData';
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

interface DatabaseConnection {
  id: string;
  name: string;
  type: string;
  host: string;
  port: number;
  database_name: string;
  status: string;
}

interface QueryResult {
  success: boolean;
  data?: Record<string, unknown>[];
  columns?: string[];
  rowCount?: number;
  error?: string;
  executionTimeMs?: number;
  connectionName?: string;
  databaseType?: string;
}

const History = () => {
  const [queries, setQueries] = useState<QueryHistory[]>([]);
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuery, setSelectedQuery] = useState<QueryHistory | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [executing, setExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();
  const { exportToCSV, exportToExcel, exportToJSON } = useExportData();

  const fetchHistory = useCallback(async () => {
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
  }, [toast]);

  const fetchConnections = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_database_connections')
        .select('id, name, type, host, port, database_name, status')
        .order('name');

      if (error) throw error;
      setConnections(data || []);
      
      // Auto-select first connected connection
      const connected = (data || []).find(c => c.status === 'connected');
      if (connected) {
        setSelectedConnection(connected.id);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchConnections();
  }, [fetchHistory, fetchConnections]);

  const handleCopy = (sql: string) => {
    navigator.clipboard.writeText(sql);
    toast({
      title: 'Copiado!',
      description: 'SQL copiado para a área de transferência',
    });
  };

  const handleExecuteQuery = async (sql: string) => {
    if (!selectedConnection) {
      toast({
        title: 'Selecione uma conexão',
        description: 'Escolha uma conexão de banco de dados antes de executar',
        variant: 'destructive',
      });
      return;
    }

    setExecuting(true);
    setQueryResult(null);
    setShowResults(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/execute-sql`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            connectionId: selectedConnection,
            sql: sql,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setQueryResult({
          success: false,
          error: result.error || 'Erro ao executar query',
        });
        return;
      }

      setQueryResult({
        success: true,
        data: result.data,
        columns: result.columns,
        rowCount: result.rowCount,
        executionTimeMs: result.executionTimeMs,
        connectionName: result.connectionName,
        databaseType: result.databaseType,
      });

      toast({
        title: 'Query executada!',
        description: `${result.rowCount} registro(s) retornado(s) em ${result.executionTimeMs}ms`,
      });
    } catch (error) {
      console.error('Error executing query:', error);
      setQueryResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleExport = (format: 'csv' | 'excel' | 'json') => {
    if (!queryResult?.data || !queryResult?.columns) {
      toast({
        title: 'Sem dados',
        description: 'Execute a query primeiro para exportar os resultados',
        variant: 'destructive',
      });
      return;
    }

    const filename = `query_${selectedQuery?.id?.slice(0, 8) || 'result'}`;

    switch (format) {
      case 'csv':
        exportToCSV(queryResult.data, queryResult.columns, { filename });
        break;
      case 'excel':
        exportToExcel(queryResult.data, queryResult.columns, { filename });
        break;
      case 'json':
        exportToJSON(queryResult.data, { filename });
        break;
    }
  };

  const filteredQueries = queries.filter(q => 
    q.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.generated_sql.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'postgresql':
        return '🐘';
      case 'mysql':
        return '🐬';
      case 'sqlserver':
        return '📊';
      case 'oracle':
        return '🔶';
      default:
        return '🗄️';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
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
        <div className="flex items-center gap-3">
          <Select value={selectedConnection} onValueChange={setSelectedConnection}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecione uma conexão..." />
            </SelectTrigger>
            <SelectContent>
              {connections.length === 0 ? (
                <SelectItem value="none" disabled>
                  Nenhuma conexão configurada
                </SelectItem>
              ) : (
                connections.map(conn => (
                  <SelectItem key={conn.id} value={conn.id}>
                    <div className="flex items-center gap-2">
                      <span>{getConnectionIcon(conn.type)}</span>
                      <span>{conn.name}</span>
                      {conn.status === 'connected' && (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="text-sm">
            {queries.length} consultas
          </Badge>
        </div>
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
                    <p className="text-sm mt-1">Gere consultas SQL na página de Chat AI</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredQueries.map((query) => (
                      <button
                        key={query.id}
                        onClick={() => {
                          setSelectedQuery(query);
                          setQueryResult(null);
                          setShowResults(false);
                        }}
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
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Detalhes da Consulta</CardTitle>
                  <CardDescription>
                    {selectedQuery 
                      ? format(new Date(selectedQuery.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
                      : 'Selecione uma consulta para ver detalhes'
                    }
                  </CardDescription>
                </div>
                {selectedQuery && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopy(selectedQuery.generated_sql)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copiar
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleExecuteQuery(selectedQuery.generated_sql)}
                      disabled={executing || !selectedConnection}
                    >
                      {executing ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-1" />
                      )}
                      Executar
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" disabled={!queryResult?.success}>
                          <Download className="w-4 h-4 mr-1" />
                          Exportar
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleExport('csv')}>
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('excel')}>
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('json')}>
                          <FileJson className="w-4 h-4 mr-2" />
                          JSON
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col">
              {selectedQuery ? (
                <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Prompt</label>
                    <p className="mt-1 p-3 rounded-lg bg-muted text-sm">{selectedQuery.prompt}</p>
                  </div>
                  
                  <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-muted-foreground">SQL Gerado</label>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Sparkles className="w-3 h-3" />
                        {selectedQuery.model_used || 'Gemini'}
                        {selectedQuery.execution_time_ms && (
                          <>
                            <Clock className="w-3 h-3 ml-2" />
                            {selectedQuery.execution_time_ms}ms
                          </>
                        )}
                      </div>
                    </div>
                    <ScrollArea className="flex-1">
                      <pre className="p-3 rounded-lg bg-muted text-sm overflow-x-auto">
                        <code>{selectedQuery.generated_sql}</code>
                      </pre>
                    </ScrollArea>
                  </div>

                  {/* Query Results */}
                  <AnimatePresence>
                    {showResults && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t pt-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Table className="w-4 h-4" />
                            <span className="text-sm font-medium">Resultado da Execução</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowResults(false)}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                        </div>

                        {executing ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <span className="ml-2 text-sm text-muted-foreground">Executando query...</span>
                          </div>
                        ) : queryResult ? (
                          queryResult.success ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>
                                  {queryResult.rowCount} registro(s) em {queryResult.executionTimeMs}ms
                                  {queryResult.connectionName && ` • ${queryResult.connectionName}`}
                                </span>
                              </div>
                              {queryResult.data && queryResult.data.length > 0 && (
                                <ScrollArea className="h-[150px] border rounded-lg">
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                      <thead className="bg-muted sticky top-0">
                                        <tr>
                                          {queryResult.columns?.map((col, i) => (
                                            <th key={i} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                                              {col}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {queryResult.data.slice(0, 50).map((row, i) => (
                                          <tr key={i} className="border-t">
                                            {queryResult.columns?.map((col, j) => (
                                              <td key={j} className="px-3 py-2 whitespace-nowrap max-w-[200px] truncate">
                                                {row[col] !== null && row[col] !== undefined 
                                                  ? String(row[col])
                                                  : <span className="text-muted-foreground italic">null</span>
                                                }
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  {queryResult.data.length > 50 && (
                                    <div className="p-2 text-center text-xs text-muted-foreground bg-muted">
                                      Mostrando 50 de {queryResult.rowCount} registros
                                    </div>
                                  )}
                                </ScrollArea>
                              )}
                              {queryResult.data && queryResult.data.length === 0 && (
                                <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Nenhum registro retornado
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                              <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                              <span>{queryResult.error}</span>
                            </div>
                          )
                        ) : null}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!showResults && queryResult && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowResults(true)}
                      className="w-full"
                    >
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Mostrar resultado anterior
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
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
