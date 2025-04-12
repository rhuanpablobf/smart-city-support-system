
import { supabase } from '@/integrations/supabase/client';
import { FilterOptions, DashboardStats } from './types';
import { applyCommonFilters } from './utils';

/**
 * Fetch dashboard statistics from Supabase with filters
 */
export const fetchDashboardStats = async (filters?: FilterOptions): Promise<DashboardStats> => {
  try {
    let query = supabase.from('conversations').select('*');
    
    query = applyCommonFilters(query, filters);
    
    // Get all conversations with applied filters
    const { data: conversations, error: conversationsError } = await query;

    if (conversationsError) throw conversationsError;
    
    const totalAttendances = conversations?.length || 0;
    
    // Get bot attendances
    const botAttendances = conversations?.filter(
      conv => conv.status === 'bot' || (conv.agent_id === null && conv.status === 'closed')
    ).length || 0;
    
    // Calculate bot percentage
    const botPercentage = totalAttendances > 0 ? Math.round((botAttendances / totalAttendances) * 100) : 0;
    
    // Apply the same filters to satisfaction surveys
    let surveyQuery = supabase.from('satisfaction_surveys').select('rating');
    
    // We need to join surveys with conversations to apply the same filters
    if (filters?.department && filters.department !== 'all' ||
        filters?.service && filters.service !== 'all' ||
        filters?.period === 'custom' || filters?.days) {
      
      // First get the IDs of the filtered conversations
      const conversationIds = conversations?.map(conv => conv.id) || [];
      if (conversationIds.length > 0) {
        surveyQuery = surveyQuery.in('conversation_id', conversationIds);
      }
    }
    
    const { data: surveys, error: surveysError } = await surveyQuery;
      
    if (surveysError) throw surveysError;
    
    // Calculate satisfaction rate
    const satisfactionRate = surveys && surveys.length > 0 
      ? Math.round((surveys.reduce((sum, survey) => sum + survey.rating, 0) / surveys.length / 5) * 100)
      : 0;
    
    // Apply the same filters to messages
    let messagesQuery = supabase.from('messages').select('conversation_id, timestamp');
    
    // Apply the same filters by conversation IDs
    if (filters?.department && filters.department !== 'all' ||
        filters?.service && filters.service !== 'all' ||
        filters?.period === 'custom' || filters?.days) {
      
      // First get the IDs of the filtered conversations
      const conversationIds = conversations?.map(conv => conv.id) || [];
      if (conversationIds.length > 0) {
        messagesQuery = messagesQuery.in('conversation_id', conversationIds);
      }
    }
    
    messagesQuery = messagesQuery.order('timestamp', { ascending: true });
    
    const { data: messages, error: messagesError } = await messagesQuery;
    
    if (messagesError) throw messagesError;
    
    // Group messages by conversation
    const conversationMessages: Record<string, {timestamps: Date[]}> = {};
    
    messages?.forEach(message => {
      if (!conversationMessages[message.conversation_id]) {
        conversationMessages[message.conversation_id] = { timestamps: [] };
      }
      conversationMessages[message.conversation_id].timestamps.push(new Date(message.timestamp));
    });
    
    // Calculate average response time (in minutes)
    let totalResponseTime = 0;
    let responseCount = 0;
    
    Object.values(conversationMessages).forEach(conversation => {
      if (conversation.timestamps.length >= 2) {
        for (let i = 1; i < conversation.timestamps.length; i++) {
          const timeDiff = (conversation.timestamps[i].getTime() - conversation.timestamps[i-1].getTime()) / 60000; // Convert to minutes
          if (timeDiff < 30) { // Only count responses under 30 minutes to filter out inactive periods
            totalResponseTime += timeDiff;
            responseCount++;
          }
        }
      }
    });
    
    const avgAttendanceTime = responseCount > 0 ? parseFloat((totalResponseTime / responseCount).toFixed(1)) : 0;
    
    return {
      totalAttendances,
      avgAttendanceTime,
      satisfactionRate,
      botAttendances,
      botPercentage
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalAttendances: 0,
      avgAttendanceTime: 0,
      satisfactionRate: 0, 
      botAttendances: 0,
      botPercentage: 0
    };
  }
};
