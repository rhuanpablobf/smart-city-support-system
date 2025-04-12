import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, PieChart } from 'lucide-react';
import { fetchDashboardStats, fetchDepartmentStats, fetchDailyStats } from '@/services/dashboardService';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useToast } from '@/components/ui/use-toast';

interface OverviewTabProps {
  period: string;
  department: string;
  service: string;
  startDate?: Date;
  endDate?: Date;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ 
  period, 
  department, 
  service,
  startDate,
  endDate 
}) => {
  const [stats, setStats] = useState({
    totalAttendances: 0,
    botAttendances: 0,
    humanAttendances: 0,
    botPercentage: 0,
    humanPercentage: 0,
    transferRate: 0,
    transferRateChange: 0
  });
  const [dailyData, setDailyData] = useState<{ date: string; count: number }[]>([]);
  const [departmentData, setDepartmentData] = useState<{ name: string; count: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Cores para o gráfico de pizza
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Determinar o número de dias com base no período
        let days = 30;
        switch (period) {
          case 'today':
            days = 1;
            break;
          case 'week':
            days = 7;
            break;
          case 'month':
            days = 30;
            break;
          case 'quarter':
            days = 90;
            break;
          case 'year':
            days = 365;
            break;
        }
        
        // Prepara os parâmetros dos filtros
        const filters = {
          period,
          department,
          service,
          startDate,
          endDate,
          days
        };
        
        console.log("Aplicando filtros:", filters);
        
        // Buscar estatísticas gerais
        const dashboardStats = await fetchDashboardStats(filters);
        
        // Buscar dados diários
        const dailyStats = await fetchDailyStats(days, filters);
        setDailyData(dailyStats);
        
        // Buscar dados por departamento
        const departmentStats = await fetchDepartmentStats(filters);
        const deptData = departmentStats.map((dept, index) => ({
          ...dept,
          color: COLORS[index % COLORS.length]
        }));
        setDepartmentData(deptData);
        
        // Calcular estatísticas
        const humanAttendances = dashboardStats.totalAttendances - dashboardStats.botAttendances;
        const humanPercentage = dashboardStats.totalAttendances > 0 
          ? Math.round((humanAttendances / dashboardStats.totalAttendances) * 100)
          : 0;
        
        setStats({
          totalAttendances: dashboardStats.totalAttendances,
          botAttendances: dashboardStats.botAttendances,
          humanAttendances,
          botPercentage: dashboardStats.botPercentage,
          humanPercentage,
          transferRate: dashboardStats.botPercentage > 0 ? Math.round((humanAttendances / dashboardStats.botAttendances) * 100) : 0,
          transferRateChange: -2.3 // Temporário, será implementado na próxima fase
        });
      } catch (error) {
        console.error("Erro ao carregar dados de visão geral:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do relatório. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [period, department, service, startDate, endDate, toast]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Atendimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAttendances}</div>
            <p className="text-xs text-muted-foreground">
              +12.2% em relação ao período anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos Bot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.botAttendances}</div>
            <p className="text-xs text-muted-foreground">
              {stats.botPercentage}% do total de atendimentos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos Humanos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.humanAttendances}</div>
            <p className="text-xs text-muted-foreground">
              {stats.humanPercentage}% do total de atendimentos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Transferência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transferRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.transferRateChange}% em relação ao período anterior
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atendimentos por Dia</CardTitle>
            <CardDescription>
              Distribuição de atendimentos nos últimos {period === 'today' ? 'dias' : period === 'week' ? '7 dias' : period === 'month' ? '30 dias' : period === 'quarter' ? '3 meses' : period === 'year' ? '12 meses' : 'dias selecionados'}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={dailyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12 }}
                    interval={5}
                  />
                  <YAxis />
                  <Tooltip labelFormatter={(label) => `Data: ${formatDate(label)}`} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Atendimentos"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <LineChart className="h-16 w-16 text-gray-300" />
                <span className="ml-2 text-gray-500">Carregando dados...</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Secretaria</CardTitle>
            <CardDescription>
              Volume de atendimentos por departamento
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <PieChart className="h-16 w-16 text-gray-300" />
                <span className="ml-2 text-gray-500">Carregando dados...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
