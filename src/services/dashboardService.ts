
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalAttendances: number;
  avgAttendanceTime: number;
  satisfactionRate: number;
  botAttendances: number;
  botPercentage: number;
}

/**
 * Fetch dashboard statistics from Supabase
 */
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get total attendances (conversations)
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('*');

    if (conversationsError) throw conversationsError;
    
    const totalAttendances = conversations?.length || 0;
    
    // Get bot attendances
    const botAttendances = conversations?.filter(
      conv => conv.status === 'bot' || (conv.agent_id === null && conv.status === 'closed')
    ).length || 0;
    
    // Calculate bot percentage
    const botPercentage = totalAttendances > 0 ? Math.round((botAttendances / totalAttendances) * 100) : 0;
    
    // Get satisfaction surveys
    const { data: surveys, error: surveysError } = await supabase
      .from('satisfaction_surveys')
      .select('rating');
      
    if (surveysError) throw surveysError;
    
    // Calculate satisfaction rate
    const satisfactionRate = surveys && surveys.length > 0 
      ? Math.round((surveys.reduce((sum, survey) => sum + survey.rating, 0) / surveys.length / 5) * 100)
      : 0;
    
    // Get messages to calculate avg time
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('conversation_id, timestamp')
      .order('timestamp', { ascending: true });
    
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

/**
 * Fetch department statistics
 */
export const fetchDepartmentStats = async () => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        department_id,
        departments!inner(name)
      `);
    
    if (error) throw error;
    
    // Group and count conversations by department
    const departmentCounts: Record<string, {name: string, count: number}> = {};
    
    data?.forEach(item => {
      const deptId = item.department_id;
      const deptName = item.departments?.name || 'Unknown';
      
      if (!departmentCounts[deptId]) {
        departmentCounts[deptId] = { name: deptName, count: 0 };
      }
      departmentCounts[deptId].count++;
    });
    
    return Object.values(departmentCounts);
  } catch (error) {
    console.error("Error fetching department stats:", error);
    return [];
  }
};

/**
 * Fetch daily attendance statistics
 */
export const fetchDailyStats = async (days: number = 30) => {
  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('conversations')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (error) throw error;
    
    // Initialize daily counts with zeros for all days
    const dailyCounts: Record<string, number> = {};
    for (let i = 0; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      dailyCounts[dateString] = 0;
    }
    
    // Count conversations by day
    data?.forEach(conversation => {
      const date = new Date(conversation.created_at).toISOString().split('T')[0];
      if (dailyCounts[date] !== undefined) {
        dailyCounts[date]++;
      }
    });
    
    // Convert to array format for chart
    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error fetching daily stats:", error);
    return [];
  }
};

/**
 * Fetch agent performance data
 */
export const fetchAgentPerformance = async () => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        agent_id,
        profiles!inner(name),
        messages(*)
      `)
      .not('agent_id', 'is', null)
      .eq('status', 'closed');
    
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
