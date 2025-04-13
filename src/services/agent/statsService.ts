
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
  myActiveChats: number;
  maxChats: number;
  waitingChats: number;
  avgWaitTime: number;
  completedChats: number;
  completedChangePercent: number;
  abandonedChats: number;
  abandonedRate: number
};

export const fetchAgentDashboardStats = async (): Promise<AgentDashboardStats> => {
  try {
    console.log("Fetching agent dashboard stats...");
    
    // Get the current user's data
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Get user profile to check max chats setting
    const { data: profileData } = await supabase
      .from('profiles')
      .select('max_simultaneous_chats')
      .eq('id', user.id)
      .single();
    
    const maxChats = profileData?.max_simultaneous_chats || 5;
    
    // Get active chats for this agent
    const { count: myActiveChats, error: activeChatsError } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('agent_id', user.id);
      
    if (activeChatsError) {
      console.error("Error fetching active chats:", activeChatsError);
      throw activeChatsError;
    }
    
    // Get waiting chats count
    const { count: waitingChats, error: waitingChatsError } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'waiting');
    
    if (waitingChatsError) {
      console.error("Error fetching waiting chats:", waitingChatsError);
      throw waitingChatsError;
    }
    
    // Get completed chats for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: completedChats, error: completedChatsError } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('updated_at', today.toISOString());
    
    if (completedChatsError) {
      console.error("Error fetching completed chats:", completedChatsError);
      throw completedChatsError;
    }
    
    // Get abandoned chats count
    const { count: abandonedChats, error: abandonedChatsError } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'abandoned');
    
    if (abandonedChatsError) {
      console.error("Error fetching abandoned chats:", abandonedChatsError);
      throw abandonedChatsError;
    }
    
    // Get total conversations for abandoned rate calculation
    const { count: totalConversations, error: totalConversationsError } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .in('status', ['completed', 'abandoned', 'closed']);
    
    if (totalConversationsError) {
      console.error("Error fetching total conversations:", totalConversationsError);
      throw totalConversationsError;
    }
    
    // Calculate average waiting time
    const { data: waitingTimeData, error: waitingTimeError } = await supabase
      .from('conversations')
      .select('created_at, updated_at')
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .limit(50); // Limit to recent conversations for better performance
      
    if (waitingTimeError) {
      console.error("Error fetching waiting time data:", waitingTimeError);
      throw waitingTimeError;
    }
    
    let totalWaitingTime = 0;
    if (waitingTimeData && waitingTimeData.length > 0) {
      waitingTimeData.forEach(conv => {
        const createTime = new Date(conv.created_at).getTime();
        const updateTime = new Date(conv.updated_at).getTime();
        totalWaitingTime += (updateTime - createTime) / 60000; // Convert to minutes
      });
    }
    
    const avgWaitTime = waitingTimeData && waitingTimeData.length > 0
      ? Math.round((totalWaitingTime / waitingTimeData.length) * 10) / 10
      : 0;
    
    // Calculate completed change percent by comparing with yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const dayBefore = new Date();
    dayBefore.setDate(dayBefore.getDate() - 2);
    dayBefore.setHours(0, 0, 0, 0);
    
    const { count: yesterdayCompletedChats, error: yesterdayCompletedChatsError } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('updated_at', yesterday.toISOString())
      .lt('updated_at', today.toISOString());
    
    if (yesterdayCompletedChatsError) {
      console.error("Error fetching yesterday's completed chats:", yesterdayCompletedChatsError);
      throw yesterdayCompletedChatsError;
    }
    
    let completedChangePercent = 0;
    if (yesterdayCompletedChats && yesterdayCompletedChats > 0) {
      completedChangePercent = Math.round(((completedChats - yesterdayCompletedChats) / yesterdayCompletedChats) * 100);
    }
    
    // Calculate abandoned rate
    const abandonedRate = totalConversations > 0 
      ? Math.round((abandonedChats / totalConversations) * 100) 
      : 0;
    
    const stats: AgentDashboardStats = {
      myActiveChats: myActiveChats || 0,
      maxChats,
      waitingChats: waitingChats || 0,
      avgWaitTime,
      completedChats: completedChats || 0,
      completedChangePercent,
      abandonedChats: abandonedChats || 0,
      abandonedRate
    };
    
    console.log("Agent dashboard stats:", stats);
    return stats;
  } catch (error) {
    console.error('Error fetching agent dashboard stats:', error);
    return {
      myActiveChats: 0,
      maxChats: 5,
      waitingChats: 0,
      avgWaitTime: 0,
      completedChats: 0,
      completedChangePercent: 0,
      abandonedChats: 0,
      abandonedRate: 0
    };
  }
};
