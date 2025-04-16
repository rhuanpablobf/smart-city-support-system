
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
      
      // Fetch all dashboard data in parallel
      const [stats, deptStats, dailyData, agentData] = await Promise.all([
        fetchDashboardStats(),
        fetchDepartmentStats(),
        fetchDailyStats(),
        fetchAgentPerformance()
      ]);
      
      console.log("Dashboard data loaded successfully");
      
      setDashboardStats(stats);
      setDepartmentStats(deptStats);
      setDailyStats(dailyData);
      setAgentPerformance(agentData);
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
