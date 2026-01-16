import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Database, 
  Key,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Plug,
  TestTube
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type ConnectionType = 'postgresql' | 'mysql' | 'sqlserver' | 'oracle';
type ConnectionStatus = 'connected' | 'disconnected' | 'error';

interface DatabaseConnection {
  id: string;
  user_id: string;
  name: string;
  type: ConnectionType;
  host: string;
  port: number;
  database_name: string;
  username: string;
  encrypted_password?: string | null;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
}

const Settings = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  
  // Profile state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // API key state
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState({
    email: true,
    reports: true,
    security: true,
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  
  // Connections state
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<DatabaseConnection | null>(null);
  const [deleteConnectionId, setDeleteConnectionId] = useState<string | null>(null);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [isSavingConnection, setIsSavingConnection] = useState(false);
  const [testingConnectionId, setTestingConnectionId] = useState<string | null>(null);
  
  // Connection form state
  const [connectionForm, setConnectionForm] = useState({
    name: '',
    type: 'postgresql' as ConnectionType,
    host: '',
    port: 5432,
    database_name: '',
    username: '',
    password: '',
  });

  // Fetch connections from database
  const fetchConnections = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingConnections(true);
    try {
      const { data, error } = await supabase
        .from('user_database_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setConnections((data || []) as DatabaseConnection[]);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setIsLoadingConnections(false);
    }
  }, [user]);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile?.full_name]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Generate a mock API key (in production, this would be stored securely)
  useEffect(() => {
    const storedKey = localStorage.getItem('user_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Erro ao atualizar perfil',
        description: 'Não foi possível atualizar suas informações',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos de senha',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Senhas não coincidem',
        description: 'A nova senha e a confirmação devem ser iguais',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: 'Senha alterada',
        description: 'Sua senha foi alterada com sucesso',
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Erro ao alterar senha',
        description: 'Não foi possível alterar sua senha',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    try {
      // Store in localStorage for now (could be stored in database)
      localStorage.setItem('notification_preferences', JSON.stringify(notifications));
      
      toast({
        title: 'Preferências salvas',
        description: 'Suas preferências de notificação foram atualizadas',
      });
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'sk_live_';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const handleGenerateApiKey = () => {
    setIsGeneratingKey(true);
    setTimeout(() => {
      const newKey = generateApiKey();
      setApiKey(newKey);
      localStorage.setItem('user_api_key', newKey);
      setIsGeneratingKey(false);
      setShowRevokeDialog(false);
      toast({
        title: 'Nova chave gerada',
        description: 'Sua nova chave de API foi gerada com sucesso',
      });
    }, 1000);
  };

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopiedApiKey(true);
      setTimeout(() => setCopiedApiKey(false), 2000);
      toast({
        title: 'Chave copiada',
        description: 'A chave de API foi copiada para a área de transferência',
      });
    }
  };

  const resetConnectionForm = () => {
    setConnectionForm({
      name: '',
      type: 'postgresql',
      host: '',
      port: 5432,
      database_name: '',
      username: '',
      password: '',
    });
    setEditingConnection(null);
  };

  const handleOpenConnectionDialog = (connection?: DatabaseConnection) => {
    if (connection) {
      setEditingConnection(connection);
      setConnectionForm({
        name: connection.name,
        type: connection.type,
        host: connection.host,
        port: connection.port,
        database_name: connection.database_name,
        username: connection.username,
        password: '',
      });
    } else {
      resetConnectionForm();
    }
    setIsConnectionDialogOpen(true);
  };

  const handleSaveConnection = async () => {
    if (!connectionForm.name || !connectionForm.host || !connectionForm.database_name || !connectionForm.username || !user) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingConnection(true);
    try {
      // Encrypt password if provided
      let encryptedPassword = editingConnection?.encrypted_password || null;
      if (connectionForm.password) {
        const { data: encryptResult, error: encryptError } = await supabase.functions.invoke('encrypt-connection', {
          body: { action: 'encrypt', text: connectionForm.password }
        });
        
        if (encryptError) {
          console.error('Encryption error:', encryptError);
          throw new Error('Falha ao criptografar senha');
        }
        encryptedPassword = encryptResult.encrypted;
      }

      if (editingConnection) {
        // Update existing connection
        const { error } = await supabase
          .from('user_database_connections')
          .update({
            name: connectionForm.name,
            type: connectionForm.type,
            host: connectionForm.host,
            port: connectionForm.port,
            database_name: connectionForm.database_name,
            username: connectionForm.username,
            encrypted_password: encryptedPassword,
            status: 'disconnected' as ConnectionStatus,
          })
          .eq('id', editingConnection.id);

        if (error) throw error;

        toast({
          title: 'Conexão atualizada',
          description: `A conexão "${connectionForm.name}" foi atualizada com sucesso`,
        });
      } else {
        // Insert new connection
        const { error } = await supabase
          .from('user_database_connections')
          .insert({
            user_id: user.id,
            name: connectionForm.name,
            type: connectionForm.type,
            host: connectionForm.host,
            port: connectionForm.port,
            database_name: connectionForm.database_name,
            username: connectionForm.username,
            encrypted_password: encryptedPassword,
            status: 'disconnected' as ConnectionStatus,
          });

        if (error) throw error;

        toast({
          title: 'Conexão adicionada',
          description: `A conexão "${connectionForm.name}" foi adicionada com sucesso`,
        });
      }

      setIsConnectionDialogOpen(false);
      resetConnectionForm();
      fetchConnections();
    } catch (error) {
      console.error('Error saving connection:', error);
      toast({
        title: 'Erro ao salvar conexão',
        description: error instanceof Error ? error.message : 'Não foi possível salvar a conexão',
        variant: 'destructive',
      });
    } finally {
      setIsSavingConnection(false);
    }
  };

  const handleTestConnection = async (connectionId: string) => {
    setTestingConnectionId(connectionId);
    try {
      const { data, error } = await supabase.functions.invoke('encrypt-connection', {
        body: { action: 'test-connection', connectionId }
      });

      if (error) throw error;

      toast({
        title: data.success ? 'Conexão válida' : 'Falha na conexão',
        description: data.message,
        variant: data.success ? 'default' : 'destructive',
      });

      fetchConnections();
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: 'Erro ao testar conexão',
        description: 'Não foi possível testar a conexão',
        variant: 'destructive',
      });
    } finally {
      setTestingConnectionId(null);
    }
  };

  const handleDeleteConnection = async () => {
    if (deleteConnectionId) {
      const connection = connections.find(c => c.id === deleteConnectionId);
      try {
        const { error } = await supabase
          .from('user_database_connections')
          .delete()
          .eq('id', deleteConnectionId);

        if (error) throw error;

        toast({
          title: 'Conexão removida',
          description: `A conexão "${connection?.name}" foi removida com sucesso`,
        });
        fetchConnections();
      } catch (error) {
        console.error('Error deleting connection:', error);
        toast({
          title: 'Erro ao remover conexão',
          description: 'Não foi possível remover a conexão',
          variant: 'destructive',
        });
      }
      setDeleteConnectionId(null);
    }
  };

  const getConnectionTypeLabel = (type: DatabaseConnection['type']) => {
    const labels = {
      postgresql: 'PostgreSQL',
      mysql: 'MySQL',
      sqlserver: 'SQL Server',
      oracle: 'Oracle',
    };
    return labels[type];
  };

  const getStatusColor = (status: DatabaseConnection['status']) => {
    const colors = {
      connected: 'bg-green-500',
      disconnected: 'bg-yellow-500',
      error: 'bg-red-500',
    };
    return colors[status];
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Conexões
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      value={profile?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar Alterações
                </Button>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Alterar Senha</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Senha Atual</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nova Senha</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                      {isChangingPassword ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Alterar Senha
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Configure como você deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações por E-mail</p>
                    <p className="text-sm text-muted-foreground">
                      Receba atualizações importantes por e-mail
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, email: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Relatórios Prontos</p>
                    <p className="text-sm text-muted-foreground">
                      Seja notificado quando seus relatórios estiverem prontos
                    </p>
                  </div>
                  <Switch
                    checked={notifications.reports}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, reports: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertas de Segurança</p>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas sobre atividades suspeitas
                    </p>
                  </div>
                  <Switch
                    checked={notifications.security}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, security: checked })
                    }
                  />
                </div>

                <Button onClick={handleSaveNotifications} disabled={isSavingNotifications}>
                  {isSavingNotifications ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar Preferências
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Conexões de Banco de Dados</CardTitle>
                  <CardDescription>
                    Gerencie suas conexões com bancos de dados
                  </CardDescription>
                </div>
                <Button onClick={() => handleOpenConnectionDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Conexão
                </Button>
              </CardHeader>
              <CardContent>
                {connections.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-4">Nenhuma conexão configurada</p>
                    <Button onClick={() => handleOpenConnectionDialog()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Conexão
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {connections.map((connection) => (
                      <div
                        key={connection.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(connection.status)}`} />
                          <div>
                            <p className="font-medium">{connection.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {getConnectionTypeLabel(connection.type)} • {connection.host}:{connection.port}/{connection.database_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTestConnection(connection.id)}
                            disabled={testingConnectionId === connection.id}
                            title="Testar conexão"
                          >
                            {testingConnectionId === connection.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Plug className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenConnectionDialog(connection)}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConnectionId(connection.id)}
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>Chaves de API</CardTitle>
                <CardDescription>
                  Gerencie suas chaves de acesso à API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiKey ? (
                  <>
                    <div className="space-y-2">
                      <Label>Sua Chave de API</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={showApiKey ? 'text' : 'password'}
                            value={apiKey}
                            readOnly
                            className="pr-10 font-mono"
                          />
                          <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showApiKey ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <Button variant="outline" onClick={handleCopyApiKey}>
                          {copiedApiKey ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Mantenha sua chave de API segura. Não compartilhe com terceiros.
                      </p>
                    </div>

                    <Button variant="destructive" onClick={() => setShowRevokeDialog(true)}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Revogar e Gerar Nova Chave
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">
                      Você ainda não tem uma chave de API
                    </p>
                    <Button onClick={handleGenerateApiKey} disabled={isGeneratingKey}>
                      {isGeneratingKey ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Key className="w-4 h-4 mr-2" />
                      )}
                      Gerar Chave de API
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Connection Dialog */}
      <Dialog open={isConnectionDialogOpen} onOpenChange={setIsConnectionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingConnection ? 'Editar Conexão' : 'Nova Conexão'}
            </DialogTitle>
            <DialogDescription>
              Configure os detalhes da conexão com o banco de dados
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="connName">Nome da Conexão *</Label>
              <Input
                id="connName"
                value={connectionForm.name}
                onChange={(e) => setConnectionForm({ ...connectionForm, name: e.target.value })}
                placeholder="Ex: Produção, Desenvolvimento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="connType">Tipo de Banco *</Label>
              <Select
                value={connectionForm.type}
                onValueChange={(value: DatabaseConnection['type']) =>
                  setConnectionForm({ ...connectionForm, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="sqlserver">SQL Server</SelectItem>
                  <SelectItem value="oracle">Oracle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="connHost">Host *</Label>
                <Input
                  id="connHost"
                  value={connectionForm.host}
                  onChange={(e) => setConnectionForm({ ...connectionForm, host: e.target.value })}
                  placeholder="localhost"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="connPort">Porta</Label>
                <Input
                  id="connPort"
                  type="number"
                  value={connectionForm.port}
                  onChange={(e) => setConnectionForm({ ...connectionForm, port: parseInt(e.target.value) || 5432 })}
                  placeholder="5432"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="connDatabase">Banco de Dados *</Label>
              <Input
                id="connDatabase"
                value={connectionForm.database_name}
                onChange={(e) => setConnectionForm({ ...connectionForm, database_name: e.target.value })}
                placeholder="nome_do_banco"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="connUsername">Usuário *</Label>
                <Input
                  id="connUsername"
                  value={connectionForm.username}
                  onChange={(e) => setConnectionForm({ ...connectionForm, username: e.target.value })}
                  placeholder="usuario"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="connPassword">Senha</Label>
                <Input
                  id="connPassword"
                  type="password"
                  value={connectionForm.password}
                  onChange={(e) => setConnectionForm({ ...connectionForm, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConnectionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveConnection} disabled={isSavingConnection}>
              {isSavingConnection ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingConnection ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Connection Dialog */}
      <AlertDialog open={!!deleteConnectionId} onOpenChange={() => setDeleteConnectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Conexão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta conexão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConnection}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke API Key Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar Chave de API</AlertDialogTitle>
            <AlertDialogDescription>
              Ao revogar sua chave atual, todas as integrações que a utilizam deixarão de funcionar.
              Uma nova chave será gerada automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleGenerateApiKey} disabled={isGeneratingKey}>
              {isGeneratingKey ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Revogar e Gerar Nova
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
