
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

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

/**
 * Busca estatísticas para o painel do atendente
 */
export const fetchAgentDashboardStats = async (agentId?: string): Promise<AgentDashboardStats> => {
  try {
    // Se não tivermos um ID de agente, tentamos obter o usuário atual
    if (!agentId) {
      const { data: { user } } = await supabase.auth.getUser();
      agentId = user?.id;
    }

    // Buscar configuração de máximo de chats simultâneos para este agente
    const { data: agentProfile } = await supabase
      .from('profiles')
      .select('max_simultaneous_chats')
      .eq('id', agentId)
      .single();

    const maxChats = agentProfile?.max_simultaneous_chats || 5;

    // Buscar chats ativos deste agente
    const { data: activeConversations, error: activeError } = await supabase
      .from('conversations')
      .select('id')
      .eq('agent_id', agentId)
      .eq('status', 'active');

    if (activeError) throw activeError;
    
    // Buscar chats em espera (sem agente atribuído)
    const { data: waitingConversations, error: waitingError } = await supabase
      .from('conversations')
      .select('id, created_at')
      .eq('status', 'waiting');
      
    if (waitingError) throw waitingError;
    
    // Calcular tempo médio de espera para conversas em espera
    const now = new Date();
    let totalWaitTime = 0;
    
    waitingConversations?.forEach(conv => {
      const waitTime = (now.getTime() - new Date(conv.created_at).getTime()) / (1000 * 60); // em minutos
      totalWaitTime += waitTime;
    });
    
    const avgWaitTime = waitingConversations && waitingConversations.length > 0
      ? Math.round(totalWaitTime / waitingConversations.length)
      : 0;
    
    // Data para comparar com o dia anterior
    const today = new Date();
    const yesterday = format(subDays(today, 1), 'yyyy-MM-dd');
    const todayStr = format(today, 'yyyy-MM-dd');
    
    // Buscar conversas completadas hoje
    const { data: completedToday, error: completedError } = await supabase
      .from('conversations')
      .select('id')
      .eq('agent_id', agentId)
      .eq('status', 'closed')
      .gte('updated_at', `${todayStr}T00:00:00`)
      .lte('updated_at', `${todayStr}T23:59:59`);
      
    if (completedError) throw completedError;
    
    // Buscar conversas completadas ontem para comparação
    const { data: completedYesterday } = await supabase
      .from('conversations')
      .select('id')
      .eq('agent_id', agentId)
      .eq('status', 'closed')
      .gte('updated_at', `${yesterday}T00:00:00`)
      .lte('updated_at', `${yesterday}T23:59:59`);
    
    // Calcular a mudança percentual nas conversas completadas
    const completedCount = completedToday?.length || 0;
    const yesterdayCount = completedYesterday?.length || 0;
    let completedChangePercent = 0;
    
    if (yesterdayCount > 0) {
      completedChangePercent = Math.round(((completedCount - yesterdayCount) / yesterdayCount) * 100);
    }
    
    // Para conversas abandonadas, vamos usar apenas um placeholder já que não temos esse status
    const abandonedCount = 0; 
    const totalCompleted = completedCount;
    const abandonedRate = totalCompleted > 0 ? Math.round((abandonedCount / totalCompleted) * 100) : 0;
    
    return {
      activeChats: activeConversations?.length || 0,
      maxChats,
      waitingChats: waitingConversations?.length || 0,
      avgWaitTime,
      completedChats: completedCount,
      completedChangePercent,
      abandonedChats: abandonedCount,
      abandonedRate
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas do painel:", error);
    // Retornar valores padrão em caso de erro
    return {
      activeChats: 0,
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
