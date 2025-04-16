
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { fetchAgentDashboardStats, AgentDashboardStats } from '@/services/agent';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { realtimeService } from '@/services/realtime/realtimeService';

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
  const [channelIds, setChannelIds] = useState<string[]>([]);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  // Function to refresh the stats
  const refreshStats = useCallback(async () => {
    if (!currentUser?.id) {
      console.log('No current user, skipping stats refresh');
      setLoading(false);
      return null;
    }
    
    try {
      setLoading(true);
      console.log('Refreshing agent dashboard stats...');
      const data = await fetchAgentDashboardStats();
      console.log('Stats refreshed:', data);
      setStats(data);
      return data;
    } catch (error: any) {
      console.error("Erro ao carregar estatísticas do painel:", error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message || "Não foi possível carregar as estatísticas do painel. Tente novamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast, currentUser?.id]);

  // Get the initial agent status when component mounts
  useEffect(() => {
    const fetchAgentStatus = async () => {
      try {
        if (!currentUser?.id) {
          console.log('No current user, skipping status fetch');
          return;
        }
        
        console.log('Fetching agent status for user:', currentUser.id);
        
        const { data, error } = await supabase
          .from('agent_statuses')
          .select('status')
          .eq('id', currentUser.id)
          .single();

        if (error) {
          console.log('Error fetching agent status:', error.message);
          if (error.code === 'PGRST116') { // record not found
            // Create a new agent status record
            const { error: insertError } = await supabase
              .from('agent_statuses')
              .insert({
                id: currentUser.id,
                status: 'online',
                active_chats: 0,
                last_active_at: new Date().toISOString()
              });
              
            if (insertError) {
              console.error('Error creating agent status:', insertError);
            } else {
              setAgentStatus('online');
            }
          }
        } else if (data) {
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
  
  // Use realtime for stats updates
  useEffect(() => {
    // Load stats on component mount
    refreshStats();
    
    // Set up realtime subscriptions for stats updates
    const ids = realtimeService.subscribeToTables(
      ['conversations', 'messages', 'agent_statuses'],
      '*',
      async (payload) => {
        // Only update stats when necessary
        const shouldRefresh = 
          payload.table === 'conversations' ||
          (payload.table === 'agent_statuses' && 
           payload.new && 
           'id' in payload.new && 
           currentUser?.id && 
           payload.new.id === currentUser.id);
        
        if (shouldRefresh) {
          console.log('Realtime update triggered for agent dashboard stats');
          await refreshStats();
        }
      }
    );
    
    setChannelIds(ids);
    
    return () => {
      // Clean up realtime subscriptions
      realtimeService.unsubscribeAll(ids);
    };
  }, [refreshStats, currentUser?.id]);

  // Function for when the agent updates their status
  const updateAgentStatus = async (value: string) => {
    if (!currentUser?.id) {
      console.log('No current user, skipping status update');
      return;
    }
    
    const newStatus = value as 'online' | 'offline' | 'break';
    setAgentStatus(newStatus);
    
    try {
      // Update agent status in database
      const { error } = await supabase
        .from('agent_statuses')
        .upsert({
          id: currentUser.id,
          status: newStatus,
          last_active_at: new Date().toISOString()
        });
        
      if (error) {
        console.error("Error updating agent status:", error);
        toast({
          title: "Erro ao atualizar status",
          description: error.message || "Não foi possível atualizar seu status. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error updating agent status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Não foi possível atualizar seu status. Tente novamente.",
        variant: "destructive"
      });
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

export default useAgentDashboard;
