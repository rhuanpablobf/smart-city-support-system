
import { supabase } from '@/integrations/supabase/client';

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

export const fetchAgentDashboardStats = async (): Promise<AgentDashboardStats> => {
  try {
    // Pegar o ID do agente atual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    
    const agentId = user.id;
    
    // Obter o número máximo de conversas simultâneas do perfil
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('max_simultaneous_chats')
      .eq('id', agentId)
      .single();
      
    if (profileError) throw profileError;
    
    const maxChats = profileData?.max_simultaneous_chats || 5;
    
    // Obter conversas ativas do agente
    const { data: activeData, error: activeError } = await supabase
      .from('conversations')
      .select('id', { count: 'exact' })
      .eq('agent_id', agentId)
      .eq('status', 'active');
      
    if (activeError) throw activeError;
    
    const activeChats = activeData?.length || 0;
    
    // Obter conversas em espera
    const { data: waitingData, error: waitingError } = await supabase
      .from('conversations')
      .select('id, created_at', { count: 'exact' })
      .eq('status', 'waiting');
      
    if (waitingError) throw waitingError;
    
    const waitingChats = waitingData?.length || 0;
    
    // Calcular tempo médio de espera
    let avgWaitTime = 0;
    if (waitingChats > 0) {
      const now = new Date();
      const totalWaitTimeMin = waitingData.reduce((sum, conv) => {
        const createdAt = new Date(conv.created_at);
        const waitTimeMin = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
        return sum + waitTimeMin;
      }, 0);
      
      avgWaitTime = Math.floor(totalWaitTimeMin / waitingChats);
    }
    
    // Obter conversas completadas hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: completedTodayData, error: completedTodayError } = await supabase
      .from('conversations')
      .select('id', { count: 'exact' })
      .eq('agent_id', agentId)
      .eq('status', 'completed')
      .gte('updated_at', today.toISOString());
      
    if (completedTodayError) throw completedTodayError;
    
    const completedChats = completedTodayData?.length || 0;
    
    // Obter conversas completadas ontem para comparação
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: completedYesterdayData, error: completedYesterdayError } = await supabase
      .from('conversations')
      .select('id', { count: 'exact' })
      .eq('agent_id', agentId)
      .eq('status', 'completed')
      .gte('updated_at', yesterday.toISOString())
      .lt('updated_at', today.toISOString());
      
    if (completedYesterdayError) throw completedYesterdayError;
    
    const completedYesterday = completedYesterdayData?.length || 0;
    
    // Calcular percentual de mudança
    let completedChangePercent = 0;
    if (completedYesterday > 0) {
      completedChangePercent = Math.round(((completedChats - completedYesterday) / completedYesterday) * 100);
    } else if (completedChats > 0) {
      completedChangePercent = 100; // se não tinha ontem, mas tem hoje, é +100%
    }
    
    // Obter conversas abandonadas hoje
    const { data: abandonedTodayData, error: abandonedTodayError } = await supabase
      .from('conversations')
      .select('id', { count: 'exact' })
      .eq('status', 'abandoned')
      .gte('updated_at', today.toISOString());
      
    if (abandonedTodayError) throw abandonedTodayError;
    
    const abandonedChats = abandonedTodayData?.length || 0;
    
    // Calcular taxa de abandono
    const totalConversations = completedChats + abandonedChats;
    let abandonedRate = 0;
    if (totalConversations > 0) {
      abandonedRate = Math.round((abandonedChats / totalConversations) * 100);
    }
    
    return {
      activeChats,
      maxChats,
      waitingChats,
      avgWaitTime,
      completedChats,
      completedChangePercent,
      abandonedChats,
      abandonedRate
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas do painel:", error);
    throw error;
  }
};
