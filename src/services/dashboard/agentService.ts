
import { supabase } from '@/integrations/supabase/client';
import { FilterOptions, AgentPerformance } from './types';
import { applyCommonFilters } from './utils';

/**
 * Fetch agent performance data with filters
 */
export const fetchAgentPerformance = async (filters?: FilterOptions): Promise<AgentPerformance[]> => {
  try {
    let query = supabase
      .from('conversations')
      .select(`
        agent_id,
        profiles!inner(name),
        messages(*)
      `)
      .not('agent_id', 'is', null)
      .eq('status', 'closed');
    
    query = applyCommonFilters(query, filters);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Calculate agent performance metrics
    const agentPerformance: Record<string, {
      name: string,
      conversations: number,
      avgResponseTime: number,
      messagesCount: number
    }> = {};
    
    data?.forEach(item => {
      const agentId = item.agent_id;
      const agentName = item.profiles?.name || 'Unknown';
      
      if (!agentPerformance[agentId]) {
        agentPerformance[agentId] = {
          name: agentName,
          conversations: 0,
          avgResponseTime: 0,
          messagesCount: 0
        };
      }
      
      agentPerformance[agentId].conversations++;
      
      if (item.messages && Array.isArray(item.messages)) {
        agentPerformance[agentId].messagesCount += item.messages.length;
      }
    });
    
    return Object.entries(agentPerformance).map(([id, data]) => ({
      id,
      ...data,
      avgResponseTime: data.conversations > 0 ? Math.round(data.messagesCount / data.conversations) : 0
    }));
  } catch (error) {
    console.error("Error fetching agent performance:", error);
    return [];
  }
};
