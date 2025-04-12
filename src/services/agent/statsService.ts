
import { supabase } from '@/integrations/supabase/client';
import { ConversationStatus } from '@/types';

type AgentStatusCount = {
  online: number;
  offline: number;
  break: number;
};

type ConversationStatusCount = {
  waiting: number;
  active: number;
  closed: number;
  abandoned: number;
  completed: number;
  bot: number;
};

export type AgentDashboardStats = {
  agents: AgentStatusCount;
  conversations: ConversationStatusCount;
  waitingTime: number; // Average in minutes
  myActiveChats: number;
};

export const fetchAgentDashboardStats = async (): Promise<AgentDashboardStats> => {
  try {
    // Get agent status count
    const { data: agentStatusData, error: agentError } = await supabase
      .from('agent_statuses')
      .select('status, count')
      .select('status')
      .not('id', 'is', null);
      
    if (agentError) throw agentError;
    
    // Count agent statuses
    const agentCount: AgentStatusCount = {
      online: 0,
      offline: 0,
      break: 0
    };
    
    // Convert the results to counts
    agentStatusData?.forEach(agent => {
      if (agent.status === 'online') agentCount.online++;
      else if (agent.status === 'break') agentCount.break++;
      else agentCount.offline++;
    });
    
    // Get conversation status count
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select('status, count', { count: 'exact' })
      .select('status');
      
    if (conversationsError) throw conversationsError;
    
    // Count conversation statuses
    const conversationCount: ConversationStatusCount = {
      waiting: 0,
      active: 0,
      closed: 0,
      abandoned: 0,
      completed: 0,
      bot: 0
    };
    
    // Convert the results to counts
    conversationsData?.forEach(conversation => {
      const status = conversation.status as keyof ConversationStatusCount;
      if (status in conversationCount) {
        conversationCount[status]++;
      }
    });
    
    // Calculate average waiting time for conversations
    const { data: waitingTimeData, error: waitingTimeError } = await supabase
      .from('conversations')
      .select('created_at, updated_at')
      .eq('status', 'completed' as ConversationStatus);
      
    if (waitingTimeError) throw waitingTimeError;
    
    let totalWaitingTime = 0;
    waitingTimeData?.forEach(conv => {
      const createTime = new Date(conv.created_at).getTime();
      const updateTime = new Date(conv.updated_at).getTime();
      totalWaitingTime += (updateTime - createTime) / 60000; // Convert to minutes
    });
    
    const averageWaitingTime = waitingTimeData && waitingTimeData.length > 0
      ? totalWaitingTime / waitingTimeData.length
      : 0;
    
    // Get the current user's active chats
    const { data: { user } } = await supabase.auth.getUser();
    
    const { count: activeChatsCount, error: activeChatsError } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('agent_id', user?.id || '');
      
    if (activeChatsError) throw activeChatsError;
    
    // Calculate abandoned rates
    const { count: totalConversations } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true });
      
    const { count: abandonedCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'abandoned' as ConversationStatus);
    
    return {
      agents: agentCount,
      conversations: conversationCount,
      waitingTime: averageWaitingTime,
      myActiveChats: activeChatsCount || 0
    };
  } catch (error) {
    console.error('Error fetching agent dashboard stats:', error);
    return {
      agents: { online: 0, offline: 0, break: 0 },
      conversations: { waiting: 0, active: 0, closed: 0, abandoned: 0, completed: 0, bot: 0 },
      waitingTime: 0,
      myActiveChats: 0
    };
  }
};
