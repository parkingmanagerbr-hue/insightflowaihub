import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  Shield,
  Search,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  status: 'pending_approval' | 'active' | 'rejected';
  created_at: string;
}

const Admin = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    userId: string;
    action: 'approve' | 'reject';
    userName: string;
  }>({ isOpen: false, userId: '', action: 'approve', userName: '' });

  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários',
        variant: 'destructive',
      });
    } else {
      setUsers(data as UserProfile[]);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  const handleAction = async () => {
    const { userId, action } = actionDialog;
    const newStatus = action === 'approve' ? 'active' : 'rejected';

    // Get user info for email
    const user = users.find(u => u.user_id === userId);

    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('user_id', userId);

    if (error) {
      toast({
        title: 'Erro',
        description: `Não foi possível ${action === 'approve' ? 'aprovar' : 'rejeitar'} o usuário`,
        variant: 'destructive',
      });
    } else {
      // Send email notification to user
      if (user) {
        try {
          await supabase.functions.invoke('send-approval-email', {
            body: {
              type: action === 'approve' ? 'approved' : 'rejected',
              userEmail: user.email,
              userName: user.full_name || '',
              userId: userId,
            },
          });
          console.log('User notification email sent');
        } catch (emailError) {
          console.error('Error sending notification email:', emailError);
        }
      }

      toast({
        title: 'Sucesso',
        description: `Usuário ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso. E-mail de notificação enviado.`,
      });
      fetchUsers();
    }

    setActionDialog({ ...actionDialog, isOpen: false });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = users.filter((u) => u.status === 'pending_approval').length;
  const activeCount = users.filter((u) => u.status === 'active').length;
  const rejectedCount = users.filter((u) => u.status === 'rejected').length;

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta página
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-3xl font-bold text-yellow-500">{pendingCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-yellow-500/10">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                  <p className="text-3xl font-bold text-green-500">{activeCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10">
                  <UserCheck className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejeitados</p>
                  <p className="text-3xl font-bold text-red-500">{rejectedCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-red-500/10">
                  <UserX className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Gerenciamento de Usuários
                </CardTitle>
                <CardDescription>
                  Aprove ou rejeite solicitações de acesso
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full md:w-[250px]"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={fetchUsers}>
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Usuário</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">Carregando...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name || 'Sem nome'}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === 'active'
                                ? 'default'
                                : user.status === 'pending_approval'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {user.status === 'active'
                              ? 'Ativo'
                              : user.status === 'pending_approval'
                              ? 'Pendente'
                              : 'Rejeitado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {user.status === 'pending_approval' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    setActionDialog({
                                      isOpen: true,
                                      userId: user.user_id,
                                      action: 'approve',
                                      userName: user.full_name || user.email,
                                    })
                                  }
                                >
                                  <UserCheck className="w-4 h-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    setActionDialog({
                                      isOpen: true,
                                      userId: user.user_id,
                                      action: 'reject',
                                      userName: user.full_name || user.email,
                                    })
                                  }
                                >
                                  <UserX className="w-4 h-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </>
                            )}
                            {user.status === 'rejected' && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  setActionDialog({
                                    isOpen: true,
                                    userId: user.user_id,
                                    action: 'approve',
                                    userName: user.full_name || user.email,
                                  })
                                }
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Aprovar
                              </Button>
                            )}
                            {user.status === 'active' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setActionDialog({
                                    isOpen: true,
                                    userId: user.user_id,
                                    action: 'reject',
                                    userName: user.full_name || user.email,
                                  })
                                }
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                Desativar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={actionDialog.isOpen}
        onOpenChange={(isOpen) => setActionDialog({ ...actionDialog, isOpen })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === 'approve' ? 'Aprovar Usuário' : 'Rejeitar Usuário'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === 'approve'
                ? `Tem certeza que deseja aprovar o acesso de "${actionDialog.userName}"? O usuário poderá acessar o sistema imediatamente.`
                : `Tem certeza que deseja rejeitar o acesso de "${actionDialog.userName}"? O usuário não poderá acessar o sistema.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={
                actionDialog.action === 'reject'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : ''
              }
            >
              {actionDialog.action === 'approve' ? 'Aprovar' : 'Rejeitar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
