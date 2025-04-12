
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchDashboardStats, 
  fetchDepartmentStats, 
  fetchDailyStats,
  fetchAgentPerformance 
} from '@/services/dashboard';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalAttendances: 0,
    avgAttendanceTime: 0,
    satisfactionRate: 0,
    botAttendances: 0,
    botPercentage: 0
  });
  const [departmentStats, setDepartmentStats] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const { toast } = useToast();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [stats, deptStats, dailyData, agentData] = await Promise.all([
          fetchDashboardStats(),
          fetchDepartmentStats(),
          fetchDailyStats(),
          fetchAgentPerformance()
        ]);
        
        setDashboardStats(stats);
        setDepartmentStats(deptStats);
        setDailyStats(dailyData);
        setAgentPerformance(agentData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as estatísticas do dashboard.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Atendimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalAttendances.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Nos últimos 30 dias
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Atendimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.avgAttendanceTime} min</div>
            <p className="text-xs text-muted-foreground">
              Entre mensagens
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Satisfação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.satisfactionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Baseado nas avaliações de usuários
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos via Bot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.botAttendances.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.botPercentage}% do total de atendimentos
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Atendimentos por Dia</CardTitle>
            <CardDescription>
              Os últimos 30 dias de atividade
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {dailyStats.length > 0 ? (
              <ChartContainer 
                className="h-80" 
                config={{ 
                  activity: { label: "Atendimentos", theme: { light: "#2563eb", dark: "#3b82f6" }}
                }}
              >
                <AreaChart data={dailyStats}>
                  <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent 
                        labelFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                        }}
                      />
                    }
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    name="activity"
                    stroke="#2563eb" 
                    fillOpacity={1} 
                    fill="url(#colorActivity)" 
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="h-80 flex items-center justify-center bg-gray-50">
                <span className="text-gray-500">Nenhum dado disponível</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Atendimentos por Departamento</CardTitle>
            <CardDescription>
              Distribuição entre secretarias
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {departmentStats.length > 0 ? (
              <ChartContainer className="h-80" config={{}}>
                <PieChart>
                  <Pie
                    data={departmentStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {departmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend formatter={(value) => value} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-80 flex items-center justify-center bg-gray-50">
                <span className="text-gray-500">Nenhum dado disponível</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Desempenho dos Atendentes</CardTitle>
          <CardDescription>
            Métricas comparativas dos últimos 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          {agentPerformance.length > 0 ? (
            <ChartContainer className="h-96" config={{}}>
              <BarChart data={agentPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="conversations" name="Atendimentos" fill="#8884d8" />
                <Bar dataKey="avgResponseTime" name="Média de Mensagens" fill="#82ca9d" />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-96 flex items-center justify-center bg-gray-50">
              <span className="text-gray-500">Nenhum dado disponível</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
