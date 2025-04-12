import { supabase } from '@/integrations/supabase/client';
import { Conversation, ConversationStatus } from '@/types';

export interface AgentDashboardStats {
  activeChats: number;
  maxChats: number;
  waitingChats: number;
  avgWaitTime: number;
  completedChats: number;
  completedChangePercent: number;
  abandonedChats: number;
  abandonedRate: number;
}

const get24HoursAgo = () => {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return twentyFourHoursAgo.toISOString();
};

const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0; // Avoid division by zero
  }
  return ((current - previous) / previous) * 100;
};

const calculateAbandonedRate = (abandonedChats: number, completedChats: number): number => {
    const totalChats = abandonedChats + completedChats;
    if (totalChats === 0) {
        return 0;
    }
    return (abandonedChats / totalChats) * 100;
};

export const fetchAgentDashboardStats = async (agentId?: string): Promise<AgentDashboardStats> => {
  if (!agentId) {
    const { data: { user } } = await supabase.auth.getUser();
    agentId = user?.id;
  }

  // Fetch active chats
  const { count: activeChatsCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agentId)
    .eq('status', 'active');

  const activeChats = activeChatsCount || 0;

  // Fetch waiting chats
  const { count: waitingChatsCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'waiting');

  const waitingChats = waitingChatsCount || 0;

  // Fetch completed chats for today
  const { count: completedChatsTodayCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'closed')
    .gte('updated_at', new Date().toISOString().slice(0, 10));

  const completedChats = completedChatsTodayCount || 0;

  // Fetch completed chats for the previous 24 hours
  const twentyFourHoursAgo = get24HoursAgo();
  const { count: completedChatsYesterdayCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'closed')
    .gte('updated_at', twentyFourHoursAgo)
    .lt('updated_at', new Date().toISOString().slice(0, 10));

  const completedChatsYesterday = completedChatsYesterdayCount || 0;

  // Calculate percentage change in completed chats
  const completedChangePercent = calculatePercentageChange(completedChats, completedChatsYesterday);

  // Fetch abandoned chats
   const { count: abandonedChatsCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'abandoned')
    .gte('updated_at', new Date().toISOString().slice(0, 10));

  const abandonedChats = abandonedChatsCount || 0;

  // Calculate abandoned rate
  const abandonedRate = calculateAbandonedRate(abandonedChats, completedChats);

  // Mocked average wait time (implement the actual calculation later)
  const avgWaitTime = 5;

  return {
    activeChats,
    maxChats: 5, // Assuming a default value, replace with actual logic if needed
    waitingChats,
    avgWaitTime,
    completedChats,
    completedChangePercent,
    abandonedChats,
    abandonedRate
  };
};
