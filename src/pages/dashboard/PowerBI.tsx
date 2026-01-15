import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Settings, 
  Plus, 
  ExternalLink,
  Maximize2,
  RefreshCw,
  LayoutDashboard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Dashboard {
  id: string;
  name: string;
  embedUrl: string;
  reportId: string;
  createdAt: string;
}

const PowerBI = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDashboard, setNewDashboard] = useState({ name: '', embedUrl: '', reportId: '' });
  const { toast } = useToast();

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
      createdAt: new Date().toISOString(),
    };

    setDashboards([...dashboards, dashboard]);
    setNewDashboard({ name: '', embedUrl: '', reportId: '' });
    setIsAddDialogOpen(false);
    
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
              <div className="space-y-2">
                <Label htmlFor="reportId">ID do Relatório (opcional)</Label>
                <Input
                  id="reportId"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={newDashboard.reportId}
                  onChange={(e) => setNewDashboard({ ...newDashboard, reportId: e.target.value })}
                />
              </div>
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
      </motion.div>

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
                        src={dashboard.embedUrl}
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
              Configuração do Power BI
            </CardTitle>
            <CardDescription>
              Como configurar a integração com Power BI Embedded
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="font-semibold mb-2">1. Publique o Relatório</div>
                <p className="text-sm text-muted-foreground">
                  Publique seu relatório no Power BI Service e configure as permissões de acesso.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="font-semibold mb-2">2. Obtenha a URL de Embed</div>
                <p className="text-sm text-muted-foreground">
                  No Power BI Service, vá em Arquivo → Inserir → Site ou portal para obter a URL.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="font-semibold mb-2">3. Configure o Acesso</div>
                <p className="text-sm text-muted-foreground">
                  Certifique-se de que o relatório está configurado para acesso público ou autenticado.
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
