
import { useState, useEffect } from 'react';
import { 
  fetchDashboardStats, 
  fetchDepartmentStats, 
  fetchDailyStats 
} from '@/services/dashboard';
import { useToast } from '@/components/ui/use-toast';

export interface OverviewFilters {
  period: string;
  department: string;
  service: string;
  startDate?: Date;
  endDate?: Date;
}

export interface OverviewStats {
  totalAttendances: number;
  botAttendances: number;
  humanAttendances: number;
  botPercentage: number;
  humanPercentage: number;
  transferRate: number;
  transferRateChange: number;
}

export const useOverviewData = (filters: OverviewFilters) => {
  const [stats, setStats] = useState<OverviewStats>({
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
        switch (filters.period) {
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
        const apiFilters = {
          ...filters,
          days
        };
        
        console.log("Aplicando filtros:", apiFilters);
        
        // Buscar estatísticas gerais
        const dashboardStats = await fetchDashboardStats(apiFilters);
        
        // Buscar dados diários
        const dailyStats = await fetchDailyStats(days, apiFilters);
        setDailyData(dailyStats);
        
        // Buscar dados por departamento
        const departmentStats = await fetchDepartmentStats(apiFilters);
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
  }, [filters.period, filters.department, filters.service, filters.startDate, filters.endDate, toast]);

  return {
    stats,
    dailyData,
    departmentData,
    loading
  };
};
