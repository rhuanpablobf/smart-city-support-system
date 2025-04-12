
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchDashboardStats, 
  fetchDepartmentStats, 
  fetchDailyStats,
  fetchAgentPerformance,
  DashboardStats,
  DepartmentStat,
  DailyStat,
  AgentPerformance
} from '@/services/dashboard';

interface UseDashboardDataReturn {
  loading: boolean;
  dashboardStats: DashboardStats;
  departmentStats: DepartmentStat[];
  dailyStats: DailyStat[];
  agentPerformance: AgentPerformance[];
}

export const useDashboardData = (): UseDashboardDataReturn => {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalAttendances: 0,
    avgAttendanceTime: 0,
    satisfactionRate: 0,
    botAttendances: 0,
    botPercentage: 0
  });
  const [departmentStats, setDepartmentStats] = useState<DepartmentStat[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const { toast } = useToast();

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

  return {
    loading,
    dashboardStats,
    departmentStats,
    dailyStats,
    agentPerformance
  };
};
