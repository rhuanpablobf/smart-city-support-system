
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { fetchAgentDashboardStats, AgentDashboardStats } from '@/services/agent';

export const useAgentDashboard = () => {
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline' | 'break'>('online');
  const [stats, setStats] = useState<AgentDashboardStats>({
    activeChats: 0,
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
  
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        const data = await fetchAgentDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Erro ao carregar estatísticas do painel:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as estatísticas do painel. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardStats();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadDashboardStats, 30000);
    
    return () => clearInterval(interval);
  }, [toast]);

  // Função para quando o agente atualiza seu status
  const updateAgentStatus = async (value: string) => {
    setAgentStatus(value as 'online' | 'offline' | 'break');
    // Implementar integração com o banco de dados para atualizar o status do agente
  };

  return {
    agentStatus,
    stats,
    loading,
    updateAgentStatus,
  };
};
