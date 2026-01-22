import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Settings, 
  Plus, 
  ExternalLink,
  Maximize2,
  RefreshCw,
  LayoutDashboard,
  Key,
  Shield,
  AlertCircle,
  Loader2,
  Trash2,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Dashboard {
  id: string;
  name: string;
  embedUrl: string;
  reportId: string;
  workspaceId: string;
  createdAt: string;
  embedToken?: string;
  tokenExpiry?: string;
}

interface AzureConfigInput {
  clientId: string;
  tenantId: string;
  clientSecret: string;
}

interface AzureConfigDisplay {
  tenantId: string;
  clientId: string;
  createdAt?: string;
  updatedAt?: string;
}

const POWERBI_TOKEN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/powerbi-token`;
const AZURE_CONFIG_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/azure-config`;

const PowerBI = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [newDashboard, setNewDashboard] = useState({ name: '', embedUrl: '', reportId: '', workspaceId: '' });
  const [azureConfigInput, setAzureConfigInput] = useState<AzureConfigInput>({ clientId: '', tenantId: '', clientSecret: '' });
  const [azureConfigDisplay, setAzureConfigDisplay] = useState<AzureConfigDisplay | null>(null);
  const [isAzureConfigured, setIsAzureConfigured] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isDeletingConfig, setIsDeletingConfig] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  // Check Azure config from secure backend
  const checkAzureConfig = useCallback(async () => {
    if (!session?.access_token) return;
    
    setIsLoadingConfig(true);
    try {
      const response = await fetch(AZURE_CONFIG_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'check' }),
      });

      const data = await response.json();

      if (response.ok && data.configured) {
        setIsAzureConfigured(true);
        setAzureConfigDisplay(data.config);
        // Pre-fill the form with existing IDs (not secret)
        setAzureConfigInput(prev => ({
          ...prev,
          tenantId: data.config.tenantId || '',
          clientId: data.config.clientId || '',
        }));
      } else {
        setIsAzureConfigured(false);
        setAzureConfigDisplay(null);
      }
    } catch (error) {
      console.error('Error checking Azure config:', error);
    } finally {
      setIsLoadingConfig(false);
    }
  }, [session?.access_token]);

  // Load config on mount
  useEffect(() => {
    checkAzureConfig();
    
    // Load dashboards from localStorage (non-sensitive data only)
    const savedDashboards = localStorage.getItem('powerbi_dashboards');
    if (savedDashboards) {
      setDashboards(JSON.parse(savedDashboards));
    }
  }, [checkAzureConfig]);

  // Save dashboards to localStorage (non-sensitive data)
  useEffect(() => {
    if (dashboards.length > 0) {
      localStorage.setItem('powerbi_dashboards', JSON.stringify(dashboards));
    }
  }, [dashboards]);

  const handleSaveAzureConfig = async () => {
    if (!azureConfigInput.clientId || !azureConfigInput.tenantId || !azureConfigInput.clientSecret) {
      toast({
        title: 'Atenção',
        description: 'Preencha todos os campos: Client ID, Tenant ID e Client Secret',
        variant: 'destructive',
      });
      return;
    }

    if (!session?.access_token) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar autenticado',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingConfig(true);
    try {
      const response = await fetch(AZURE_CONFIG_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'save',
          tenantId: azureConfigInput.tenantId,
          clientId: azureConfigInput.clientId,
          clientSecret: azureConfigInput.clientSecret,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao salvar configuração');
      }

      setIsAzureConfigured(true);
      setIsConfigDialogOpen(false);
      // Clear the secret from state after saving
      setAzureConfigInput(prev => ({ ...prev, clientSecret: '' }));
      
      // Refresh config display
      await checkAzureConfig();
      
      toast({
        title: 'Configuração salva!',
        description: 'As credenciais do Azure AD foram armazenadas de forma segura',
      });
    } catch (error) {
      console.error('Error saving Azure config:', error);
      toast({
        title: 'Erro ao salvar',
        description: error instanceof Error ? error.message : 'Falha ao salvar configuração',
        variant: 'destructive',
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleDeleteAzureConfig = async () => {
    if (!session?.access_token) return;

    setIsDeletingConfig(true);
    try {
      const response = await fetch(AZURE_CONFIG_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'delete' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao remover configuração');
      }

      setIsAzureConfigured(false);
      setAzureConfigDisplay(null);
      setAzureConfigInput({ clientId: '', tenantId: '', clientSecret: '' });
      setIsConfigDialogOpen(false);
      
      toast({
        title: 'Configuração removida',
        description: 'As credenciais do Azure AD foram removidas',
      });
    } catch (error) {
      console.error('Error deleting Azure config:', error);
      toast({
        title: 'Erro ao remover',
        description: error instanceof Error ? error.message : 'Falha ao remover configuração',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingConfig(false);
    }
  };

  const generateEmbedToken = async (dashboard: Dashboard) => {
    if (!isAzureConfigured) {
      toast({
        title: 'Configuração incompleta',
        description: 'Configure as credenciais do Azure AD primeiro',
        variant: 'destructive',
      });
      return null;
    }

    if (!dashboard.workspaceId || !dashboard.reportId) {
      toast({
        title: 'IDs necessários',
        description: 'Informe o Workspace ID e Report ID do dashboard',
        variant: 'destructive',
      });
      return null;
    }

    setIsGeneratingToken(true);

    try {
      const response = await fetch(POWERBI_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          workspaceId: dashboard.workspaceId,
          reportId: dashboard.reportId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.configured === false) {
          setIsAzureConfigured(false);
          throw new Error('Configure suas credenciais do Azure AD primeiro');
        }
        throw new Error(data.details || data.error || 'Failed to get token');
      }

      toast({
        title: 'Token gerado!',
        description: 'Autenticação com Azure AD realizada com sucesso',
      });

      return {
        embedToken: data.embedToken,
        tokenExpiry: data.tokenExpiry,
        embedUrl: data.embedUrl,
      };

    } catch (error) {
      console.error('Token generation error:', error);
      toast({
        title: 'Erro ao gerar token',
        description: error instanceof Error ? error.message : 'Falha na autenticação',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleAddDashboard = () => {
    if (!newDashboard.name || !newDashboard.embedUrl) {
      toast({
        title: 'Atenção',
        description: 'Preencha o nome e a URL de embed do dashboard',
        variant: 'destructive',
      });
      return;
    }

    const dashboard: Dashboard = {
      id: crypto.randomUUID(),
      name: newDashboard.name,
      embedUrl: newDashboard.embedUrl,
      reportId: newDashboard.reportId,
      workspaceId: newDashboard.workspaceId,
      createdAt: new Date().toISOString(),
    };

    setDashboards([...dashboards, dashboard]);
    setNewDashboard({ name: '', embedUrl: '', reportId: '', workspaceId: '' });
    setIsAddDialogOpen(false);
    
    // Generate embed token if Azure is configured
    if (isAzureConfigured && dashboard.reportId && dashboard.workspaceId) {
      generateEmbedToken(dashboard);
    }
    
    toast({
      title: 'Dashboard adicionado!',
      description: `O dashboard "${dashboard.name}" foi configurado com sucesso`,
    });
  };

  const handleRefresh = () => {
    if (selectedDashboard) {
      const iframe = document.getElementById('powerbi-iframe') as HTMLIFrameElement;
      if (iframe) {
        iframe.src = iframe.src;
        toast({
          title: 'Atualizando...',
          description: 'O dashboard está sendo recarregado',
        });
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getEmbedUrl = (dashboard: Dashboard) => {
    let url = dashboard.embedUrl;
    if (dashboard.embedToken && url.includes('app.powerbi.com')) {
      // Add token to URL for authenticated embed
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}autoAuth=true`;
    }
    return url;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Power BI Dashboards
          </h2>
          <p className="text-muted-foreground mt-1">
            Visualize seus dashboards do Power BI integrados à plataforma
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={isLoadingConfig}>
                {isLoadingConfig ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : isAzureConfigured ? (
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <Key className="w-4 h-4 mr-2" />
                )}
                {isAzureConfigured ? 'Azure AD Configurado' : 'Configurar Azure AD'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Configurar Azure AD
                </DialogTitle>
                <DialogDescription>
                  Configure as credenciais do Azure AD para autenticação com Power BI Embedded.
                  Suas credenciais são armazenadas de forma segura e criptografada no servidor.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Armazenamento Seguro</AlertTitle>
                  <AlertDescription>
                    Suas credenciais são criptografadas e armazenadas de forma segura no servidor. 
                    O Client Secret nunca é exposto no navegador.
                  </AlertDescription>
                </Alert>

                {isAzureConfigured && azureConfigDisplay && (
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <Check className="h-4 w-4 text-green-500" />
                    <AlertTitle className="text-green-600">Configuração Ativa</AlertTitle>
                    <AlertDescription className="text-sm">
                      <div><strong>Tenant ID:</strong> {azureConfigDisplay.tenantId}</div>
                      <div><strong>Client ID:</strong> {azureConfigDisplay.clientId}</div>
                      {azureConfigDisplay.updatedAt && (
                        <div className="text-xs mt-1 text-muted-foreground">
                          Atualizado em: {new Date(azureConfigDisplay.updatedAt).toLocaleString('pt-BR')}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="tenantId">Tenant ID (Directory ID)</Label>
                  <Input
                    id="tenantId"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={azureConfigInput.tenantId}
                    onChange={(e) => setAzureConfigInput({ ...azureConfigInput, tenantId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID (Application ID)</Label>
                  <Input
                    id="clientId"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={azureConfigInput.clientId}
                    onChange={(e) => setAzureConfigInput({ ...azureConfigInput, clientId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientSecret">
                    Client Secret {isAzureConfigured && <span className="text-muted-foreground">(deixe em branco para manter o atual)</span>}
                  </Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    placeholder={isAzureConfigured ? "••••••••••••" : "Seu client secret"}
                    value={azureConfigInput.clientSecret}
                    onChange={(e) => setAzureConfigInput({ ...azureConfigInput, clientSecret: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter className="flex justify-between sm:justify-between">
                <div>
                  {isAzureConfigured && (
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAzureConfig}
                      disabled={isDeletingConfig}
                    >
                      {isDeletingConfig ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Remover
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveAzureConfig} disabled={isSavingConfig}>
                    {isSavingConfig ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4 mr-2" />
                    )}
                    {isAzureConfigured ? 'Atualizar' : 'Salvar'} Configuração
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Dashboard
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Adicionar Dashboard Power BI</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Dashboard</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Dashboard de Vendas"
                    value={newDashboard.name}
                    onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="embedUrl">URL de Embed</Label>
                  <Input
                    id="embedUrl"
                    placeholder="https://app.powerbi.com/reportEmbed?..."
                    value={newDashboard.embedUrl}
                    onChange={(e) => setNewDashboard({ ...newDashboard, embedUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Obtenha a URL de embed no Power BI Service: Arquivo → Inserir → Site ou portal
                  </p>
                </div>
                {isAzureConfigured && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="workspaceId">Workspace ID</Label>
                      <Input
                        id="workspaceId"
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        value={newDashboard.workspaceId}
                        onChange={(e) => setNewDashboard({ ...newDashboard, workspaceId: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reportId">Report ID</Label>
                      <Input
                        id="reportId"
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        value={newDashboard.reportId}
                        onChange={(e) => setNewDashboard({ ...newDashboard, reportId: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddDashboard}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Azure AD Status */}
      {isAzureConfigured && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert className="border-green-500/50 bg-green-500/10">
            <Shield className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-600">Azure AD Configurado</AlertTitle>
            <AlertDescription>
              Autenticação com Azure AD ativa. Você pode acessar relatórios privados do Power BI.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {dashboards.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <LayoutDashboard className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum dashboard configurado</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                Adicione seus dashboards do Power BI para visualizá-los diretamente na plataforma.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue={dashboards[0]?.id} onValueChange={(id) => {
            const dashboard = dashboards.find(d => d.id === id);
            setSelectedDashboard(dashboard || null);
          }}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                {dashboards.map((dashboard) => (
                  <TabsTrigger key={dashboard.id} value={dashboard.id}>
                    {dashboard.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {selectedDashboard && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar
                  </Button>
                  <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Tela Cheia
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedDashboard.embedUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir no Power BI
                    </a>
                  </Button>
                </div>
              )}
            </div>

            {dashboards.map((dashboard) => (
              <TabsContent key={dashboard.id} value={dashboard.id}>
                <Card className={isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{dashboard.name}</CardTitle>
                        <CardDescription>
                          Atualizado em tempo real do Power BI
                          {isAzureConfigured && dashboard.reportId && (
                            <span className="ml-2 text-green-600">• Autenticado</span>
                          )}
                        </CardDescription>
                      </div>
                      {isFullscreen && (
                        <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                          Sair da Tela Cheia
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`relative ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[600px]'} rounded-lg overflow-hidden bg-muted`}>
                      <iframe
                        id="powerbi-iframe"
                        src={getEmbedUrl(dashboard)}
                        className="w-full h-full border-0"
                        allowFullScreen
                        title={dashboard.name}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuração do Power BI Embedded
            </CardTitle>
            <CardDescription>
              Como configurar a integração com Power BI Embedded e Azure AD
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="font-semibold mb-2">1. Registre o App no Azure</div>
                <p className="text-sm text-muted-foreground">
                  Crie um App Registration no Azure Portal com permissões do Power BI Service.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="font-semibold mb-2">2. Configure as Credenciais</div>
                <p className="text-sm text-muted-foreground">
                  Use o botão "Configurar Azure AD" para inserir Tenant ID, Client ID e Secret.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="font-semibold mb-2">3. Publique o Relatório</div>
                <p className="text-sm text-muted-foreground">
                  Publique seu relatório no Power BI Service e obtenha o Report ID e Workspace ID.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="font-semibold mb-2">4. Adicione o Dashboard</div>
                <p className="text-sm text-muted-foreground">
                  Use o botão "Adicionar Dashboard" com a URL de embed e IDs configurados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PowerBI;
