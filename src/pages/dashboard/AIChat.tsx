import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Loader2,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Database,
  BarChart3,
  Code,
  Play,
  CheckCircle2,
  XCircle,
  Table,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  StopCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOllama } from '@/hooks/useOllama';
import { streamChat, type OllamaChatMessage } from '@/services/ollamaService';
import { supabase } from '@/integrations/supabase/client';
import OllamaStatus from '@/components/OllamaStatus';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sql?: string;
}

interface DatabaseConnection {
  id: string;
  name: string;
  type: string;
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
}

const SYSTEM_PROMPT = `Você é um assistente especialista em dados, SQL, Business Intelligence e Power BI.
Quando o usuário pedir SQL, gere queries seguras (somente SELECT/WITH) dentro de blocos de código \`\`\`sql.
Responda sempre em português brasileiro.
Seja objetivo, preciso e forneça explicações claras.`;

const suggestedQuestions = [
  {
    icon: Database,
    title: "Gerar SQL",
    question: "Gere uma query SQL para listar os 10 produtos mais vendidos do último mês com total de vendas",
  },
  {
    icon: BarChart3,
    title: "Análise de Dados",
    question: "Quais são as melhores práticas para criar um dashboard de vendas no Power BI?",
  },
  {
    icon: Code,
    title: "DAX Formula",
    question: "Como criar uma medida DAX para calcular a variação percentual de vendas mês a mês?",
  },
  {
    icon: Sparkles,
    title: "Insights",
    question: "Que tipos de análises posso fazer com dados de e-commerce para melhorar conversões?",
  },
];

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [executingMessageId, setExecutingMessageId] = useState<string | null>(null);
  const [queryResults, setQueryResults] = useState<Record<string, QueryResult>>({});
  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({});
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { session } = useAuth();
  const { selectedModel, models, status: ollamaStatus } = useOllama();

  const fetchConnections = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_database_connections')
        .select('id, name, type, status')
        .order('name');

      if (error) throw error;
      setConnections(data || []);

      const connected = (data || []).find((c) => c.status === 'connected');
      if (connected) setSelectedConnection(connected.id);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
    setQueryResults({});
    setExpandedResults({});
    toast({ title: 'Chat limpo', description: 'Todas as mensagens foram removidas' });
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
  };

  const extractSQLFromContent = (content: string): string | null => {
    const sqlBlockMatch = content.match(/```sql\n([\s\S]*?)```/i);
    if (sqlBlockMatch) return sqlBlockMatch[1].trim();

    const codeBlockMatch = content.match(/```\n?([\s\S]*?)```/);
    if (codeBlockMatch) {
      const code = codeBlockMatch[1].trim();
      if (/^(SELECT|WITH|INSERT|UPDATE|DELETE)/i.test(code)) return code;
    }
    return null;
  };

  const handleExecuteSQL = async (messageId: string, sql: string) => {
    if (!selectedConnection) {
      toast({
        title: 'Selecione uma conexão',
        description: 'Escolha uma conexão de banco de dados antes de executar',
        variant: 'destructive',
      });
      return;
    }

    setExecutingMessageId(messageId);
    setExpandedResults((prev) => ({ ...prev, [messageId]: true }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/execute-sql`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ connectionId: selectedConnection, sql }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setQueryResults((prev) => ({
          ...prev,
          [messageId]: { success: false, error: result.error || 'Erro ao executar query' },
        }));
        return;
      }

      setQueryResults((prev) => ({
        ...prev,
        [messageId]: {
          success: true,
          data: result.data,
          columns: result.columns,
          rowCount: result.rowCount,
          executionTimeMs: result.executionTimeMs,
          connectionName: result.connectionName,
        },
      }));

      toast({
        title: 'Query executada!',
        description: `${result.rowCount} registro(s) retornado(s) em ${result.executionTimeMs}ms`,
      });
    } catch (error) {
      setQueryResults((prev) => ({
        ...prev,
        [messageId]: {
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      }));
    } finally {
      setExecutingMessageId(null);
    }
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    if (!ollamaStatus.connected) {
      toast({
        title: 'Ollama offline',
        description: 'Inicie o Ollama com "ollama serve" e tente novamente.',
        variant: 'destructive',
      });
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantId = crypto.randomUUID();
    let assistantContent = '';

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Build message history for Ollama
    const history: OllamaChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: text },
    ];

    // Add placeholder assistant message
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', timestamp: new Date() },
    ]);

    try {
      for await (const chunk of streamChat(history, selectedModel, abortController.signal)) {
        assistantContent += chunk;
        const extractedSQL = extractSQLFromContent(assistantContent);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: assistantContent, sql: extractedSQL || undefined }
              : m,
          ),
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User stopped — keep partial content
      } else {
        toast({
          title: 'Erro',
          description:
            error instanceof Error ? error.message : 'Falha ao obter resposta do Ollama',
          variant: 'destructive',
        });
        if (!assistantContent) {
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        }
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatContent = (content: string, messageId: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeContent = part.slice(3, -3);
        const firstNewline = codeContent.indexOf('\n');
        const language = firstNewline > 0 ? codeContent.slice(0, firstNewline).trim() : '';
        const code = firstNewline > 0 ? codeContent.slice(firstNewline + 1) : codeContent;
        const isSQL =
          language.toLowerCase() === 'sql' || /^(SELECT|WITH)/i.test(code.trim());

        return (
          <div key={index} className="my-3 rounded-lg overflow-hidden bg-muted/50 border">
            <div className="flex items-center justify-between px-3 py-1 bg-muted border-b">
              <span className="text-xs text-muted-foreground">{language || 'code'}</span>
              <div className="flex items-center gap-1">
                {isSQL && selectedConnection && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => handleExecuteSQL(messageId, code)}
                    disabled={executingMessageId === messageId}
                  >
                    {executingMessageId === messageId ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3 mr-1" />
                    )}
                    Executar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => handleCopy(code, `${messageId}-${index}`)}
                >
                  {copiedId === `${messageId}-${index}` ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
            <pre className="p-3 overflow-x-auto text-sm">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      return (
        <span key={index}>
          {part.split(/(`[^`]+`)/g).map((segment, i) => {
            if (segment.startsWith('`') && segment.endsWith('`')) {
              return (
                <code key={i} className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">
                  {segment.slice(1, -1)}
                </code>
              );
            }
            return segment;
          })}
        </span>
      );
    });
  };

  const getConnectionIcon = (type: string) => {
    const icons: Record<string, string> = {
      postgresql: '🐘',
      mysql: '🐬',
      sqlserver: '📊',
      oracle: '🔶',
    };
    return icons[type] || '🗄️';
  };

  const renderQueryResult = (messageId: string) => {
    const result = queryResults[messageId];
    const isExpanded = expandedResults[messageId];
    if (!result) return null;

    return (
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 border-t pt-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4" />
                <span className="text-sm font-medium">Resultado</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6"
                onClick={() =>
                  setExpandedResults((prev) => ({ ...prev, [messageId]: false }))
                }
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
            </div>

            {result.success ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {result.rowCount} registro(s) em {result.executionTimeMs}ms
                    {result.connectionName && ` • ${result.connectionName}`}
                  </span>
                </div>
                {result.data && result.data.length > 0 && (
                  <ScrollArea className="h-[150px] border rounded-lg bg-background">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            {result.columns?.map((col, i) => (
                              <th key={i} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.data.slice(0, 20).map((row, i) => (
                            <tr key={i} className="border-t">
                              {result.columns?.map((col, j) => (
                                <td
                                  key={j}
                                  className="px-3 py-2 whitespace-nowrap max-w-[200px] truncate"
                                >
                                  {row[col] !== null && row[col] !== undefined ? (
                                    String(row[col])
                                  ) : (
                                    <span className="text-muted-foreground italic">null</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {result.data.length > 20 && (
                      <div className="p-2 text-center text-xs text-muted-foreground bg-muted">
                        Mostrando 20 de {result.rowCount} registros
                      </div>
                    )}
                  </ScrollArea>
                )}
                {result.data?.length === 0 && (
                  <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Nenhum registro retornado
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{result.error}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4 flex-wrap gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            InsightFlow AI Chat
          </h2>
          <p className="text-muted-foreground mt-1">
            Chat analítico com Ollama local — privado e sem custo por token
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Ollama status badge */}
          <OllamaStatus showModel />

          {/* Model selector */}
          {models.length > 0 && (
            <Select value={selectedModel} onValueChange={(v) => localStorage.setItem('ollama_model', v)}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue placeholder="Modelo..." />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.name} value={m.name} className="text-xs">
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* DB connection */}
          <Select value={selectedConnection} onValueChange={setSelectedConnection}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Selecione conexão..." />
            </SelectTrigger>
            <SelectContent>
              {connections.length === 0 ? (
                <SelectItem value="none" disabled>
                  Nenhuma conexão
                </SelectItem>
              ) : (
                connections.map((conn) => (
                  <SelectItem key={conn.id} value={conn.id} className="text-xs">
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

          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearChat} className="h-8 text-xs">
              <Trash2 className="w-3 h-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </motion.div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Como posso ajudar?</h3>
              <p className="text-muted-foreground mb-1 max-w-md">
                Sou seu assistente de IA local (via Ollama) para análise de dados, SQL e Power BI.
              </p>
              {!ollamaStatus.connected && (
                <p className="text-sm text-destructive mb-4">
                  Ollama offline — execute <code className="font-mono bg-muted px-1 rounded">ollama serve</code> para continuar.
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-4">
                {suggestedQuestions.map((item, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSend(item.question)}
                    className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 text-left transition-colors disabled:opacity-50"
                    disabled={!ollamaStatus.connected}
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {item.question}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}

                    <div
                      className={`group relative max-w-[80%] ${
                        message.role === 'user' ? 'order-first' : ''
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted rounded-bl-md'
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.role === 'assistant'
                            ? formatContent(message.content, message.id)
                            : message.content}
                        </div>
                        {message.content === '' && message.role === 'assistant' && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}

                        {message.role === 'assistant' &&
                          queryResults[message.id] &&
                          !expandedResults[message.id] && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full mt-2 h-6 text-xs"
                              onClick={() =>
                                setExpandedResults((prev) => ({ ...prev, [message.id]: true }))
                              }
                            >
                              <ChevronDown className="w-3 h-3 mr-1" />
                              Mostrar resultado da query
                            </Button>
                          )}

                        {message.role === 'assistant' && renderQueryResult(message.id)}
                      </div>

                      {message.role === 'assistant' && message.content && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCopy(message.content, message.id)}
                        >
                          {copiedId === message.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                ollamaStatus.connected
                  ? 'Digite sua pergunta sobre dados, SQL, Power BI...'
                  : 'Ollama offline — execute "ollama serve" para usar o chat'
              }
              className="min-h-[60px] max-h-[200px] resize-none"
              disabled={isLoading || !ollamaStatus.connected}
            />
            {isLoading ? (
              <Button
                onClick={handleStop}
                size="icon"
                variant="destructive"
                className="h-[60px] w-[60px]"
              >
                <StopCircle className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || !ollamaStatus.connected}
                size="icon"
                className="h-[60px] w-[60px]"
              >
                <Send className="w-5 h-5" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Powered by Ollama ({selectedModel}) • Enter para enviar, Shift+Enter para nova linha
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AIChat;
