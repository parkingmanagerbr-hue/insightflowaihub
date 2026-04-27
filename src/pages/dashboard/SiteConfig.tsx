import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Settings2,
  Bot,
  Key,
  Users,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Shield,
  UserPlus,
  Cpu,
  Sparkles,
  Zap,
  Server,
  Mail,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeAPIKey, sanitizeInput, validateOllamaURL } from '@/lib/security';

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface AIProvider {
  id: string;
  name: string;
  type: 'ollama' | 'openai' | 'anthropic' | 'gemini' | 'custom';
  enabled: boolean;
  baseUrl?: string;
  apiKey?: string;
  defaultModel?: string;
  models?: string[];
  status?: 'connected' | 'error' | 'unchecked';
}

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  requireApproval: boolean;
  allowSelfRegistration: boolean;
  maxUsersPerPlan: number;
  supportEmail: string;
  maintenanceMode: boolean;
}

interface NewUserForm {
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  tempPassword: string;
}

const AI_PROVIDER_TEMPLATES: Omit<AIProvider, 'id' | 'enabled' | 'apiKey' | 'status'>[] = [
  {
    name: 'Ollama (Local)',
    type: 'ollama',
    baseUrl: 'http://localhost:11434',
    defaultModel: 'llama3',
    models: ['llama3', 'llama3:8b', 'llama3:70b', 'mistral', 'codellama', 'phi3', 'gemma2'],
  },
  {
    name: 'OpenAI',
    type: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  },
  {
    name: 'Anthropic Claude',
    type: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-5-sonnet-20241022',
    models: [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
    ],
  },
  {
    name: 'Google Gemini',
    type: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-1.5-pro',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'],
  },
];

const STORAGE_KEY_PROVIDERS = '_if_admin_providers';
const STORAGE_KEY_SITE = '_if_admin_site';

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function maskKey(key: string): string {
  if (!key || key.length < 8) return '••••••••';
  return key.slice(0, 4) + '••••••••' + key.slice(-4);
}

function loadProviders(): AIProvider[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROVIDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProviders(providers: AIProvider[]): void {
  // Strip API keys from localStorage — stored in sessionStorage by security module
  const sanitized = providers.map(({ apiKey: _, ...p }) => p);
  localStorage.setItem(STORAGE_KEY_PROVIDERS, JSON.stringify(sanitized));
  // Store keys separately in sessionStorage
  providers.forEach((p) => {
    if (p.apiKey) {
      sessionStorage.setItem(`_if_key_${p.id}`, sanitizeAPIKey(p.apiKey));
    }
  });
}

function loadKeys(providers: AIProvider[]): AIProvider[] {
  return providers.map((p) => ({
    ...p,
    apiKey: sessionStorage.getItem(`_if_key_${p.id}`) ?? p.apiKey,
  }));
}

function defaultSiteSettings(): SiteSettings {
  return {
    siteName: 'InsightFlow AI Hub',
    siteDescription: 'Plataforma de BI e Analytics com IA',
    requireApproval: true,
    allowSelfRegistration: true,
    maxUsersPerPlan: 50,
    supportEmail: '',
    maintenanceMode: false,
  };
}

// ──────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────

const SiteConfig = () => {
  const { toast } = useToast();
  const { session } = useAuth();

  // AI Providers
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [showKeyFor, setShowKeyFor] = useState<Record<string, boolean>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Site Settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings());
  const [savingSettings, setSavingSettings] = useState(false);

  // User Creation
  const [newUser, setNewUser] = useState<NewUserForm>({
    email: '',
    fullName: '',
    role: 'user',
    tempPassword: '',
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Load saved providers on mount
  useEffect(() => {
    const saved = loadKeys(loadProviders());
    if (saved.length === 0) {
      // Seed with Ollama default enabled
      setProviders([
        {
          id: crypto.randomUUID(),
          name: 'Ollama (Local)',
          type: 'ollama',
          enabled: true,
          baseUrl: 'http://localhost:11434',
          defaultModel: 'llama3',
          models: AI_PROVIDER_TEMPLATES[0].models,
          status: 'unchecked',
        },
      ]);
    } else {
      setProviders(saved.map((p) => ({ ...p, status: p.status ?? 'unchecked' })));
    }

    // Load site settings
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SITE);
      if (raw) setSiteSettings({ ...defaultSiteSettings(), ...JSON.parse(raw) });
    } catch {
      // use defaults
    }
  }, []);

  // ── Provider Actions ─────────────────────────────────────────

  const handleAddProvider = () => {
    if (!selectedTemplate) return;
    const template = AI_PROVIDER_TEMPLATES.find((t) => t.type === selectedTemplate);
    if (!template) return;

    const newProvider: AIProvider = {
      ...template,
      id: crypto.randomUUID(),
      enabled: false,
      status: 'unchecked',
    };
    const updated = [...providers, newProvider];
    setProviders(updated);
    saveProviders(updated);
    setShowAddProvider(false);
    setSelectedTemplate('');
    toast({ title: 'Provedor adicionado', description: `${template.name} adicionado com sucesso.` });
  };

  const handleToggleProvider = (id: string) => {
    const updated = providers.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p));
    setProviders(updated);
    saveProviders(updated);
  };

  const handleSaveProvider = (provider: AIProvider) => {
    // Validate URL for Ollama
    if (provider.type === 'ollama' && provider.baseUrl) {
      const urlCheck = validateOllamaURL(provider.baseUrl);
      if (!urlCheck.valid) {
        toast({ title: 'URL inválida', description: urlCheck.error, variant: 'destructive' });
        return;
      }
    }
    const updated = providers.map((p) => (p.id === provider.id ? provider : p));
    setProviders(updated);
    saveProviders(updated);
    setEditingProvider(null);
    toast({ title: 'Provedor salvo', description: `Configurações de ${provider.name} salvas.` });
  };

  const handleDeleteProvider = (id: string) => {
    const updated = providers.filter((p) => p.id !== id);
    setProviders(updated);
    saveProviders(updated);
    sessionStorage.removeItem(`_if_key_${id}`);
    setConfirmDelete(null);
    toast({ title: 'Provedor removido' });
  };

  const handleTestProvider = useCallback(async (provider: AIProvider) => {
    setTestingId(provider.id);
    let ok = false;
    let errorMsg = '';

    try {
      if (provider.type === 'ollama') {
        const url = provider.baseUrl ?? 'http://localhost:11434';
        const urlCheck = validateOllamaURL(url);
        if (!urlCheck.valid) throw new Error(urlCheck.error);
        const res = await fetch(`${urlCheck.normalized}/api/version`, {
          signal: AbortSignal.timeout(4000),
        });
        ok = res.ok;
        if (!ok) errorMsg = `HTTP ${res.status}`;
      } else {
        // For cloud APIs: just check the base URL is reachable (no key validation to avoid burning quota)
        const res = await fetch(`${provider.baseUrl}/models`, {
          headers: provider.apiKey ? { Authorization: `Bearer ${provider.apiKey}` } : {},
          signal: AbortSignal.timeout(6000),
        });
        ok = res.ok || res.status === 401; // 401 = reachable but key invalid
        if (res.status === 401) {
          errorMsg = 'API key inválida ou ausente';
          ok = false;
        }
      }
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Timeout ou sem resposta';
    }

    const updated = providers.map((p) =>
      p.id === provider.id ? { ...p, status: ok ? 'connected' : 'error' } : p,
    );
    setProviders(updated);
    saveProviders(updated);
    setTestingId(null);

    toast({
      title: ok ? 'Conexão OK' : 'Falha na conexão',
      description: ok ? `${provider.name} respondeu com sucesso.` : errorMsg,
      variant: ok ? 'default' : 'destructive',
    });
  }, [providers, toast]);

  // ── Site Settings Actions ─────────────────────────────────────

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    await new Promise((r) => setTimeout(r, 500)); // simulate async save
    localStorage.setItem(STORAGE_KEY_SITE, JSON.stringify(siteSettings));
    setSavingSettings(false);
    toast({ title: 'Configurações salvas', description: 'As configurações do site foram atualizadas.' });
  };

  // ── User Creation ─────────────────────────────────────────────

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.tempPassword) {
      toast({ title: 'Campos obrigatórios', description: 'E-mail e senha são obrigatórios.', variant: 'destructive' });
      return;
    }
    if (newUser.tempPassword.length < 8) {
      toast({ title: 'Senha fraca', description: 'A senha deve ter pelo menos 8 caracteres.', variant: 'destructive' });
      return;
    }

    setCreatingUser(true);
    try {
      // Create user via Supabase Admin API (requires service role — delegated to Edge Function)
      const { error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: newUser.email.trim().toLowerCase(),
          fullName: sanitizeInput(newUser.fullName),
          role: newUser.role,
          password: newUser.tempPassword,
        },
      });

      if (error) throw error;

      toast({
        title: 'Usuário criado',
        description: `${newUser.email} foi criado como ${newUser.role === 'admin' ? 'administrador' : 'usuário'}.`,
      });
      setNewUser({ email: '', fullName: '', role: 'user', tempPassword: '' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao criar usuário';
      // Fallback: invite via standard Supabase auth
      if (msg.includes('not found') || msg.includes('functions')) {
        // Edge function not deployed — use regular invite
        const { error: inviteErr } = await supabase.auth.admin?.inviteUserByEmail(newUser.email) ?? { error: new Error('Admin API not available') };
        if (inviteErr) {
          toast({ title: 'Erro', description: 'Use o painel do Supabase para criar usuários admin.', variant: 'destructive' });
        } else {
          toast({ title: 'Convite enviado', description: `E-mail de convite enviado para ${newUser.email}.` });
          setNewUser({ email: '', fullName: '', role: 'user', tempPassword: '' });
        }
      } else {
        toast({ title: 'Erro ao criar usuário', description: msg, variant: 'destructive' });
      }
    } finally {
      setCreatingUser(false);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────

  const statusBadge = (status?: AIProvider['status']) => {
    if (status === 'connected') return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Conectado</Badge>;
    if (status === 'error') return <Badge variant="destructive">Erro</Badge>;
    return <Badge variant="secondary">Não testado</Badge>;
  };

  const providerIcon = (type: AIProvider['type']) => {
    if (type === 'ollama') return <Cpu className="w-4 h-4" />;
    if (type === 'openai') return <Sparkles className="w-4 h-4" />;
    if (type === 'anthropic') return <Bot className="w-4 h-4" />;
    if (type === 'gemini') return <Zap className="w-4 h-4" />;
    return <Server className="w-4 h-4" />;
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Configurações do Site</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie provedores de IA, API keys, usuários e configurações gerais
          </p>
        </div>
      </motion.div>

      <Tabs defaultValue="ai-providers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ai-providers" className="gap-2">
            <Bot className="w-4 h-4" /> Provedores de IA
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="site" className="gap-2">
            <Globe className="w-4 h-4" /> Site
          </TabsTrigger>
        </TabsList>

        {/* ── AI PROVIDERS ─────────────────────────────────────────── */}
        <TabsContent value="ai-providers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    Provedores de IA
                  </CardTitle>
                  <CardDescription>
                    Configure quais IAs o sistema utiliza e gerencie suas API keys
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowAddProvider(true)}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" /> Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {providers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum provedor configurado</p>
                </div>
              )}

              {providers.map((provider) => (
                <motion.div
                  key={provider.id}
                  layout
                  className="border rounded-lg p-4 space-y-3"
                >
                  {editingProvider?.id === provider.id ? (
                    // ── Edit Form ────────────────────────────────────────
                    <ProviderEditForm
                      provider={editingProvider}
                      onChange={setEditingProvider}
                      onSave={() => handleSaveProvider(editingProvider)}
                      onCancel={() => setEditingProvider(null)}
                      showKey={showKeyFor[provider.id]}
                      onToggleKey={() =>
                        setShowKeyFor((p) => ({ ...p, [provider.id]: !p[provider.id] }))
                      }
                    />
                  ) : (
                    // ── Display Row ──────────────────────────────────────
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-md">{providerIcon(provider.type)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{provider.name}</span>
                            {statusBadge(provider.status)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {provider.defaultModel} · {provider.baseUrl}
                          </p>
                          {provider.apiKey && (
                            <p className="text-xs text-muted-foreground font-mono">
                              <Key className="w-3 h-3 inline mr-1" />
                              {maskKey(provider.apiKey)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Switch
                          checked={provider.enabled}
                          onCheckedChange={() => handleToggleProvider(provider.id)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestProvider(provider)}
                          disabled={testingId === provider.id}
                        >
                          {testingId === provider.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProvider({ ...provider })}
                        >
                          <Settings2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setConfirmDelete(provider.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Security reminder */}
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="pt-4 pb-4">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-600 dark:text-amber-400">Segurança das API Keys</p>
                  <p className="text-muted-foreground mt-1">
                    As API keys são armazenadas localmente em <code className="text-xs bg-muted px-1 rounded">sessionStorage</code> e
                    nunca enviadas para nossos servidores. Para produção multi-usuário, configure as chaves no painel do Supabase como Secrets.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── USERS ────────────────────────────────────────────────── */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Criar Novo Usuário
              </CardTitle>
              <CardDescription>
                Crie um novo usuário diretamente pela plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nu-email">
                    <Mail className="w-3.5 h-3.5 inline mr-1" />
                    E-mail *
                  </Label>
                  <Input
                    id="nu-email"
                    type="email"
                    placeholder="usuario@empresa.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nu-name">Nome completo</Label>
                  <Input
                    id="nu-name"
                    placeholder="João da Silva"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser((p) => ({ ...p, fullName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nu-role">Perfil</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(v) => setNewUser((p) => ({ ...p, role: v as 'user' | 'admin' }))}
                  >
                    <SelectTrigger id="nu-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nu-pass">
                    <Lock className="w-3.5 h-3.5 inline mr-1" />
                    Senha temporária *
                  </Label>
                  <div className="relative">
                    <Input
                      id="nu-pass"
                      type={showUserPassword ? 'text' : 'password'}
                      placeholder="Mín. 8 caracteres"
                      value={newUser.tempPassword}
                      onChange={(e) => setNewUser((p) => ({ ...p, tempPassword: e.target.value }))}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUserPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCreateUser}
                disabled={creatingUser}
                className="gap-2"
              >
                {creatingUser ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Criar Usuário
              </Button>

              <Separator />

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  O usuário receberá um e-mail de boas-vindas com as instruções de acesso.
                  Usuários marcados como <strong>Administrador</strong> têm acesso total ao painel de configurações
                  e podem aprovar/rejeitar novos cadastros.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Políticas de Acesso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Aprovar novos cadastros manualmente</p>
                  <p className="text-xs text-muted-foreground">
                    Novos usuários ficam em espera até um admin aprovar
                  </p>
                </div>
                <Switch
                  checked={siteSettings.requireApproval}
                  onCheckedChange={(v) => setSiteSettings((p) => ({ ...p, requireApproval: v }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Permitir auto-registro</p>
                  <p className="text-xs text-muted-foreground">
                    Usuários podem se cadastrar pelo formulário público
                  </p>
                </div>
                <Switch
                  checked={siteSettings.allowSelfRegistration}
                  onCheckedChange={(v) => setSiteSettings((p) => ({ ...p, allowSelfRegistration: v }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SITE SETTINGS ────────────────────────────────────────── */}
        <TabsContent value="site" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Informações do Site
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do site</Label>
                  <Input
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings((p) => ({ ...p, siteName: e.target.value }))}
                    placeholder="InsightFlow AI Hub"
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail de suporte</Label>
                  <Input
                    type="email"
                    value={siteSettings.supportEmail}
                    onChange={(e) => setSiteSettings((p) => ({ ...p, supportEmail: e.target.value }))}
                    placeholder="suporte@empresa.com"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Descrição</Label>
                  <Input
                    value={siteSettings.siteDescription}
                    onChange={(e) => setSiteSettings((p) => ({ ...p, siteDescription: e.target.value }))}
                    placeholder="Plataforma de BI e Analytics com IA"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" />
                Manutenção e Limites
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Modo manutenção</p>
                  <p className="text-xs text-muted-foreground">
                    Exibe uma página de manutenção para usuários não-admin
                  </p>
                </div>
                <Switch
                  checked={siteSettings.maintenanceMode}
                  onCheckedChange={(v) => setSiteSettings((p) => ({ ...p, maintenanceMode: v }))}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Máximo de usuários por plano</Label>
                <Input
                  type="number"
                  min={1}
                  max={10000}
                  value={siteSettings.maxUsersPerPlan}
                  onChange={(e) =>
                    setSiteSettings((p) => ({ ...p, maxUsersPerPlan: parseInt(e.target.value) || 50 }))
                  }
                  className="w-32"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="gap-2"
          >
            {savingSettings ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar Configurações
          </Button>
        </TabsContent>
      </Tabs>

      {/* ── Add Provider Dialog ─────────────────────────────────── */}
      <AlertDialog open={showAddProvider} onOpenChange={setShowAddProvider}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Adicionar Provedor de IA</AlertDialogTitle>
            <AlertDialogDescription>
              Escolha o tipo de provedor para configurar
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {AI_PROVIDER_TEMPLATES.map((t) => (
              <button
                key={t.type}
                onClick={() => setSelectedTemplate(t.type)}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                  selectedTemplate === t.type
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <div className="p-1.5 bg-muted rounded">{providerIcon(t.type)}</div>
                <span className="font-medium text-sm">{t.name}</span>
              </button>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddProvider} disabled={!selectedTemplate}>
              Adicionar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Delete Confirm ──────────────────────────────────────── */}
      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover provedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá o provedor e sua API key da sessão atual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && handleDeleteProvider(confirmDelete)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Provider Edit Form (sub-component)
// ──────────────────────────────────────────────────────────────

interface ProviderEditFormProps {
  provider: AIProvider;
  onChange: (p: AIProvider) => void;
  onSave: () => void;
  onCancel: () => void;
  showKey: boolean;
  onToggleKey: () => void;
}

const ProviderEditForm = ({
  provider,
  onChange,
  onSave,
  onCancel,
  showKey,
  onToggleKey,
}: ProviderEditFormProps) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h4 className="font-medium flex items-center gap-2">
        <Settings2 className="w-4 h-4 text-primary" />
        Editando: {provider.name}
      </h4>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs">Nome</Label>
        <Input
          value={provider.name}
          onChange={(e) => onChange({ ...provider, name: e.target.value })}
          className="h-8"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Base URL</Label>
        <Input
          value={provider.baseUrl ?? ''}
          onChange={(e) => onChange({ ...provider, baseUrl: e.target.value })}
          className="h-8 font-mono text-xs"
          placeholder="http://localhost:11434"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Modelo padrão</Label>
        <Input
          value={provider.defaultModel ?? ''}
          onChange={(e) => onChange({ ...provider, defaultModel: e.target.value })}
          className="h-8"
          placeholder="llama3"
        />
      </div>
      {provider.type !== 'ollama' && (
        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1">
            <Key className="w-3 h-3" /> API Key
          </Label>
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              value={provider.apiKey ?? ''}
              onChange={(e) => onChange({ ...provider, apiKey: e.target.value })}
              className="h-8 font-mono text-xs pr-8"
              placeholder="sk-..."
            />
            <button
              type="button"
              onClick={onToggleKey}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
    <div className="flex gap-2">
      <Button size="sm" onClick={onSave} className="gap-1">
        <CheckCircle2 className="w-3.5 h-3.5" /> Salvar
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  </div>
);

export default SiteConfig;
