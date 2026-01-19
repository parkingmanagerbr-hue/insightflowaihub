import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Search, 
  Calendar, 
  Database, 
  Clock, 
  CheckCircle2,
  XCircle,
  Download,
  FileSpreadsheet,
  FileJson,
  Table,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useExportData } from '@/hooks/useExportData';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface QueryExecution {
  id: string;
  connection_name: string;
  database_type: string;
  executed_sql: string;
  success: boolean;
  row_count: number | null;
  columns: string[] | null;
  result_preview: Record<string, unknown>[] | null;
  error_message: string | null;
  execution_time_ms: number | null;
  created_at: string;
}

interface DatabaseConnection {
  id: string;
  name: string;
  type: string;
  status: string;
}

const Executions = () => {
  const [executions, setExecutions] = useState<QueryExecution[]>([]);
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExecution, setSelectedExecution] = useState<QueryExecution | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [executing, setExecuting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [executionToDelete, setExecutionToDelete] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(true);
  const { toast } = useToast();
  const { session } = useAuth();
  const { exportToCSV, exportToExcel, exportToJSON } = useExportData();

  const fetchExecutions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sql_query_executions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Type assertion for JSONB fields
      const typedData = (data || []).map(exec => ({
        ...exec,
        columns: exec.columns as string[] | null,
        result_preview: exec.result_preview as Record<string, unknown>[] | null,
      }));
      
      setExecutions(typedData);
    } catch (error) {
      console.error('Error fetching executions:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as execuções',
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
        .select('id, name, type, status')
        .order('name');

      if (error) throw error;
      setConnections(data || []);
      
      const connected = (data || []).find(c => c.status === 'connected');
      if (connected) {
        setSelectedConnection(connected.id);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  }, []);

  useEffect(() => {
    fetchExecutions();
    fetchConnections();
  }, [fetchExecutions, fetchConnections]);

  const handleReExecute = async (sql: string) => {
    if (!selectedConnection) {
      toast({
        title: 'Selecione uma conexão',
        description: 'Escolha uma conexão de banco de dados antes de executar',
        variant: 'destructive',
      });
      return;
    }

    setExecuting(true);

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
        toast({
          title: 'Erro na execução',
          description: result.error || 'Erro ao executar query',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Query re-executada!',
          description: `${result.rowCount} registro(s) em ${result.executionTimeMs}ms`,
        });
        // Refresh executions list
        fetchExecutions();
      }
    } catch (error) {
      console.error('Error executing query:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleDelete = async () => {
    if (!executionToDelete) return;

    try {
      const { error } = await supabase
        .from('sql_query_executions')
        .delete()
        .eq('id', executionToDelete);

      if (error) throw error;

      setExecutions(prev => prev.filter(e => e.id !== executionToDelete));
      if (selectedExecution?.id === executionToDelete) {
        setSelectedExecution(null);
      }

      toast({
        title: 'Excluído',
        description: 'Execução removida do histórico',
      });
    } catch (error) {
      console.error('Error deleting execution:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a execução',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setExecutionToDelete(null);
    }
  };

  const handleExport = (format: 'csv' | 'excel' | 'json') => {
    if (!selectedExecution?.result_preview || !selectedExecution?.columns) {
      toast({
        title: 'Sem dados',
        description: 'Esta execução não possui resultados para exportar',
        variant: 'destructive',
      });
      return;
    }

    const filename = `query_result_${selectedExecution.id.slice(0, 8)}`;

    switch (format) {
      case 'csv':
        exportToCSV(selectedExecution.result_preview, selectedExecution.columns, { filename });
        break;
      case 'excel':
        exportToExcel(selectedExecution.result_preview, selectedExecution.columns, { filename });
        break;
      case 'json':
        exportToJSON(selectedExecution.result_preview, { filename });
        break;
    }
  };

  const filteredExecutions = executions.filter(e => 
    e.executed_sql.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.connection_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'postgresql': return '🐘';
      case 'mysql': return '🐬';
      case 'sqlserver': return '📊';
      case 'oracle': return '🔶';
      default: return '🗄️';
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
            <Play className="w-6 h-6 text-primary" />
            Histórico de Execuções
          </h2>
          <p className="text-muted-foreground mt-1">
            Todas as queries SQL executadas com seus resultados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedConnection} onValueChange={setSelectedConnection}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Conexão para re-executar..." />
            </SelectTrigger>
            <SelectContent>
              {connections.map(conn => (
                <SelectItem key={conn.id} value={conn.id}>
                  <div className="flex items-center gap-2">
                    <span>{getConnectionIcon(conn.type)}</span>
                    <span>{conn.name}</span>
                    {conn.status === 'connected' && (
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="text-sm">
            {executions.length} execuções
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
            placeholder="Buscar por SQL ou conexão..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Execution List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-[650px]">
            <CardHeader>
              <CardTitle className="text-lg">Execuções Recentes</CardTitle>
              <CardDescription>
                Clique em uma execução para ver detalhes e resultados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[530px] pr-4">
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredExecutions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <Database className="w-8 h-8 mb-2" />
                    <p>Nenhuma execução encontrada</p>
                    <p className="text-sm mt-1">Execute queries na página de Chat AI ou Histórico</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredExecutions.map((execution) => (
                      <button
                        key={execution.id}
                        onClick={() => {
                          setSelectedExecution(execution);
                          setShowResults(true);
                        }}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                          selectedExecution?.id === execution.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span>{getConnectionIcon(execution.database_type)}</span>
                              <span className="font-medium text-sm">{execution.connection_name}</span>
                              {execution.success ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-destructive" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate font-mono">
                              {execution.executed_sql.slice(0, 60)}...
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(execution.created_at), "dd/MM HH:mm", { locale: ptBR })}
                              </div>
                              {execution.execution_time_ms && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {execution.execution_time_ms}ms
                                </div>
                              )}
                              {execution.row_count !== null && (
                                <div className="flex items-center gap-1">
                                  <Table className="w-3 h-3" />
                                  {execution.row_count} rows
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Execution Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-[650px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Detalhes da Execução</CardTitle>
                  <CardDescription>
                    {selectedExecution 
                      ? format(new Date(selectedExecution.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", { locale: ptBR })
                      : 'Selecione uma execução para ver detalhes'
                    }
                  </CardDescription>
                </div>
                {selectedExecution && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReExecute(selectedExecution.executed_sql)}
                      disabled={executing || !selectedConnection}
                    >
                      {executing ? (
                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-1" />
                      )}
                      Re-executar
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" disabled={!selectedExecution.success}>
                          <Download className="w-4 h-4 mr-1" />
                          Exportar
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleExport('csv')}>
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Exportar CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('excel')}>
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Exportar Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('json')}>
                          <FileJson className="w-4 h-4 mr-2" />
                          Exportar JSON
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setExecutionToDelete(selectedExecution.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col">
              {selectedExecution ? (
                <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                  {/* Status */}
                  <div className="flex items-center gap-4">
                    {selectedExecution.success ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Sucesso
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Erro
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {getConnectionIcon(selectedExecution.database_type)} {selectedExecution.connection_name}
                    </span>
                    {selectedExecution.execution_time_ms && (
                      <span className="text-sm text-muted-foreground">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {selectedExecution.execution_time_ms}ms
                      </span>
                    )}
                  </div>

                  {/* SQL */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">SQL Executado</label>
                    <ScrollArea className="h-[100px] mt-1">
                      <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-x-auto">
                        <code>{selectedExecution.executed_sql}</code>
                      </pre>
                    </ScrollArea>
                  </div>

                  {/* Results or Error */}
                  {selectedExecution.success ? (
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Table className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Resultados ({selectedExecution.row_count} registros)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowResults(!showResults)}
                        >
                          {showResults ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>

                      <AnimatePresence>
                        {showResults && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex-1 overflow-hidden"
                          >
                            {selectedExecution.result_preview && selectedExecution.result_preview.length > 0 ? (
                              <ScrollArea className="h-[280px] border rounded-lg">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead className="bg-muted sticky top-0">
                                      <tr>
                                        {selectedExecution.columns?.map((col, i) => (
                                          <th key={i} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                                            {col}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedExecution.result_preview.map((row, i) => (
                                        <tr key={i} className="border-t">
                                          {selectedExecution.columns?.map((col, j) => (
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
                                {selectedExecution.row_count && selectedExecution.row_count > 100 && (
                                  <div className="p-2 text-center text-xs text-muted-foreground bg-muted">
                                    Mostrando 100 de {selectedExecution.row_count} registros
                                  </div>
                                )}
                              </ScrollArea>
                            ) : (
                              <div className="flex items-center justify-center py-8 text-muted-foreground">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Nenhum registro retornado
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-hidden">
                      <label className="text-sm font-medium text-muted-foreground">Erro</label>
                      <div className="mt-1 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                        <XCircle className="w-4 h-4 inline mr-2" />
                        {selectedExecution.error_message}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Play className="w-12 h-12 mb-4" />
                  <p>Selecione uma execução</p>
                  <p className="text-sm">para visualizar os detalhes e resultados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta execução do histórico? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Executions;
