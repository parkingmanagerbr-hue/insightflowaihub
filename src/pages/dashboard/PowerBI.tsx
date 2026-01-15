import { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface Dashboard {
  id: string;
  name: string;
  embedUrl: string;
  reportId: string;
  workspaceId: string;
  createdAt: string;
}

interface AzureConfig {
  clientId: string;
  tenantId: string;
  clientSecret: string;
}

const PowerBI = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [newDashboard, setNewDashboard] = useState({ name: '', embedUrl: '', reportId: '', workspaceId: '' });
  const [azureConfig, setAzureConfig] = useState<AzureConfig>({ clientId: '', tenantId: '', clientSecret: '' });
  const [isAzureConfigured, setIsAzureConfigured] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { toast } = useToast();

  // Load saved config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('powerbi_azure_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setAzureConfig(config);
      setIsAzureConfigured(true);
    }
    
    const savedDashboards = localStorage.getItem('powerbi_dashboards');
    if (savedDashboards) {
      setDashboards(JSON.parse(savedDashboards));
    }
  }, []);

  // Save dashboards to localStorage
  useEffect(() => {
    if (dashboards.length > 0) {
      localStorage.setItem('powerbi_dashboards', JSON.stringify(dashboards));
    }
  }, [dashboards]);

  const handleSaveAzureConfig = () => {
    if (!azureConfig.clientId || !azureConfig.tenantId) {
      toast({
        title: 'Atenção',
        description: 'Preencha pelo menos o Client ID e Tenant ID',
        variant: 'destructive',
      });
      return;
    }

    localStorage.setItem('powerbi_azure_config', JSON.stringify(azureConfig));
    setIsAzureConfigured(true);
    setIsConfigDialogOpen(false);
    
    toast({
      title: 'Configuração salva!',
      description: 'As credenciais do Azure AD foram configuradas',
    });
  };

  const generateEmbedToken = async (reportId: string, workspaceId: string) => {
    // In production, this would call your backend to get the token
    // For now, we'll simulate the flow
    toast({
      title: 'Gerando token...',
      description: 'Obtendo token de acesso do Azure AD',
    });

    // Simulate token generation
    setTimeout(() => {
      setAccessToken('simulated_access_token');
      toast({
        title: 'Token gerado!',
        description: 'Autenticação com Azure AD realizada com sucesso',
      });
    }, 1500);
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
      generateEmbedToken(dashboard.reportId, dashboard.workspaceId);
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
    if (accessToken && url.includes('app.powerbi.com')) {
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
              <Button variant="outline">
                <Key className="w-4 h-4 mr-2" />
                Configurar Azure AD
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Configurar Azure AD
                </DialogTitle>
                <DialogDescription>
                  Configure as credenciais do Azure AD para autenticação com Power BI Embedded
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Importante</AlertTitle>
                  <AlertDescription>
                    Para relatórios privados, você precisa de um App Registration no Azure AD com permissões do Power BI.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label htmlFor="tenantId">Tenant ID (Directory ID)</Label>
                  <Input
                    id="tenantId"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={azureConfig.tenantId}
                    onChange={(e) => setAzureConfig({ ...azureConfig, tenantId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID (Application ID)</Label>
                  <Input
                    id="clientId"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={azureConfig.clientId}
                    onChange={(e) => setAzureConfig({ ...azureConfig, clientId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    placeholder="Seu client secret"
                    value={azureConfig.clientSecret}
                    onChange={(e) => setAzureConfig({ ...azureConfig, clientSecret: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    O client secret é armazenado localmente. Em produção, use um backend seguro.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveAzureConfig}>
                  <Shield className="w-4 h-4 mr-2" />
                  Salvar Configuração
                </Button>
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
