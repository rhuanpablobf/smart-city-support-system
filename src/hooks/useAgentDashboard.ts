
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { fetchAgentDashboardStats, AgentDashboardStats } from '@/services/agent';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export const useAgentDashboard = () => {
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline' | 'break'>('online');
  const [stats, setStats] = useState<AgentDashboardStats>({
    myActiveChats: 0,
    maxChats: 5,
    waitingChats: 0,
    avgWaitTime: 0,
    completedChats: 0,
    completedChangePercent: 0,
    abandonedChats: 0,
    abandonedRate: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  // Function to refresh the stats
  const refreshStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAgentDashboardStats();
      setStats(data);
      return data;
    } catch (error) {
      console.error("Erro ao carregar estatísticas do painel:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as estatísticas do painel. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get the initial agent status when component mounts
  useEffect(() => {
    const fetchAgentStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('agent_statuses')
            .select('status')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          
          // If the user is a master admin, they should start as offline by default
          if (currentUser && currentUser.role === 'master') {
            setAgentStatus('offline');
          } else if (data) {
            setAgentStatus(data.status as 'online' | 'offline' | 'break');
          }
        }
      } catch (error) {
        console.error("Error fetching agent status:", error);
      }
    };

    fetchAgentStatus();
  }, [currentUser]);
  
  useEffect(() => {
    // Load stats on component mount
    refreshStats().catch(console.error);
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(() => {
      refreshStats().catch(console.error);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refreshStats]);

  // Função para quando o agente atualiza seu status
  const updateAgentStatus = async (value: string) => {
    const newStatus = value as 'online' | 'offline' | 'break';
    setAgentStatus(newStatus);
    
    try {
      // Update agent status in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('agent_statuses')
          .upsert({
            id: user.id,
            status: newStatus,
            last_active_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error("Error updating agent status:", error);
    }
  };

  return {
    agentStatus,
    stats,
    loading,
    updateAgentStatus,
    refreshStats,
  };
};
