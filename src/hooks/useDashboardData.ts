
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
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
  error: string | null;
  dashboardStats: DashboardStats;
  departmentStats: DepartmentStat[];
  dailyStats: DailyStat[];
  agentPerformance: AgentPerformance[];
  refreshData: () => Promise<void>;
}

export const useDashboardData = (): UseDashboardDataReturn => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Loading dashboard data...");
      
      // Fetch all dashboard data in parallel with timeouts to prevent blocking
      const statsPromise = Promise.race([
        fetchDashboardStats(),
        new Promise<DashboardStats>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout fetching stats')), 10000)
        )
      ]);
      
      const deptStatsPromise = Promise.race([
        fetchDepartmentStats(),
        new Promise<DepartmentStat[]>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout fetching department stats')), 10000)
        )
      ]);
      
      const dailyStatsPromise = Promise.race([
        fetchDailyStats(),
        new Promise<DailyStat[]>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout fetching daily stats')), 10000)
        )
      ]);
      
      const agentStatsPromise = Promise.race([
        fetchAgentPerformance(),
        new Promise<AgentPerformance[]>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout fetching agent performance')), 10000)
        )
      ]);
      
      // Use Promise.allSettled to handle each promise independently
      const results = await Promise.allSettled([
        statsPromise,
        deptStatsPromise,
        dailyStatsPromise,
        agentStatsPromise
      ]);
      
      // Process results
      if (results[0].status === 'fulfilled') {
        setDashboardStats(results[0].value);
      } else {
        console.error("Error loading stats:", results[0].reason);
      }
      
      if (results[1].status === 'fulfilled') {
        setDepartmentStats(results[1].value);
      } else {
        console.error("Error loading department stats:", results[1].reason);
      }
      
      if (results[2].status === 'fulfilled') {
        setDailyStats(results[2].value);
      } else {
        console.error("Error loading daily stats:", results[2].reason);
      }
      
      if (results[3].status === 'fulfilled') {
        setAgentPerformance(results[3].value);
      } else {
        console.error("Error loading agent performance:", results[3].reason);
      }
      
      console.log("Dashboard data loaded successfully");
      
      if (results.some(result => result.status === 'rejected')) {
        toast({
          title: "Aviso",
          description: "Alguns dados do dashboard não puderam ser carregados. As informações exibidas podem estar incompletas.",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      setError(error.message || "Não foi possível carregar os dados do dashboard");
      toast({
        title: "Erro ao carregar dados",
        description: error.message || "Não foi possível carregar as estatísticas do dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Load data on initial mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    loading,
    error,
    dashboardStats,
    departmentStats,
    dailyStats,
    agentPerformance,
    refreshData: loadDashboardData
  };
};
