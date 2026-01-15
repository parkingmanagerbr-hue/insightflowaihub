import { motion } from 'framer-motion';
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

const stats = [
  {
    title: 'Relatórios Gerados',
    value: '24',
    change: '+12%',
    trend: 'up',
    icon: FileText,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Consultas SQL',
    value: '156',
    change: '+8%',
    trend: 'up',
    icon: BarChart3,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Tempo Médio',
    value: '2.4s',
    change: '-15%',
    trend: 'down',
    icon: Clock,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    title: 'Taxa de Sucesso',
    value: '98.5%',
    change: '+2%',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
];

const recentReports = [
  { id: 1, name: 'Vendas Q4 2024', date: '15/01/2025', status: 'completed' },
  { id: 2, name: 'Análise de Clientes', date: '14/01/2025', status: 'completed' },
  { id: 3, name: 'Relatório Financeiro', date: '13/01/2025', status: 'processing' },
  { id: 4, name: 'KPIs Mensais', date: '12/01/2025', status: 'completed' },
];

const DashboardHome = () => {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-2xl p-6"
      >
        <h2 className="text-2xl font-bold text-foreground">
          Olá, {profile?.full_name || 'Usuário'}! 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          Bem-vindo ao InsightFlow. Veja um resumo das suas atividades.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-sm text-green-500">{stat.change}</span>
                      <span className="text-sm text-muted-foreground">vs mês anterior</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">{report.date}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.status === 'completed'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}
                  >
                    {report.status === 'completed' ? 'Concluído' : 'Processando'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardHome;
