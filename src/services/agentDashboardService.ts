
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
    
    // Buscar conversas abandonadas (onde o usuário saiu antes de ser atendido)
    const { data: abandonedConversations, error: abandonedError } = await supabase
      .from('conversations')
      .select('id')
      .eq('agent_id', agentId)
      .eq('status', 'abandoned');
      
    if (abandonedError) throw abandonedError;
    
    // Calcular taxa de abandono
    const abandonedCount = abandonedConversations?.length || 0;
    const totalCompleted = completedCount + abandonedCount;
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

/**
 * Busca conversas para o painel do atendente
 */
export const fetchAgentConversations = async (agentId?: string) => {
  try {
    // Se não tivermos um ID de agente, tentamos obter o usuário atual
    if (!agentId) {
      const { data: { user } } = await supabase.auth.getUser();
      agentId = user?.id;
    }

    // Buscar conversas ativas deste agente
    const { data: activeConversations, error: activeError } = await supabase
      .from('conversations')
      .select(`
        id,
        user_cpf,
        department_id,
        service_id,
        status,
        last_message_at,
        departments(name),
        services(name)
      `)
      .eq('agent_id', agentId)
      .eq('status', 'active')
      .order('last_message_at', { ascending: false });

    if (activeError) throw activeError;
    
    // Buscar conversas em espera
    const { data: waitingConversations, error: waitingError } = await supabase
      .from('conversations')
      .select(`
        id,
        user_cpf,
        department_id,
        service_id,
        status,
        last_message_at,
        created_at,
        departments(name),
        services(name)
      `)
      .eq('status', 'waiting')
      .order('created_at', { ascending: true });
      
    if (waitingError) throw waitingError;
    
    // Buscar conversas sendo atendidas pelo bot
    const { data: botConversations, error: botError } = await supabase
      .from('conversations')
      .select(`
        id,
        user_cpf,
        department_id,
        service_id,
        status,
        last_message_at,
        departments(name),
        services(name)
      `)
      .eq('status', 'bot')
      .order('last_message_at', { ascending: false })
      .limit(20);
      
    if (botError) throw botError;
    
    // Formatar os dados para corresponder à interface esperada pelo componente
    const formatConversation = (conversation: any) => ({
      id: conversation.id,
      userId: null,
      userCpf: conversation.user_cpf,
      departmentId: conversation.department_id,
      departmentName: conversation.departments?.name,
      serviceId: conversation.service_id,
      serviceName: conversation.services?.name,
      agentId: conversation.agent_id,
      status: conversation.status,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
      lastMessageAt: conversation.last_message_at,
      inactivityWarnings: conversation.inactivity_warnings || 0,
    });
    
    return {
      active: activeConversations?.map(formatConversation) || [],
      waiting: waitingConversations?.map(formatConversation) || [],
      bot: botConversations?.map(formatConversation) || []
    };
  } catch (error) {
    console.error("Erro ao buscar conversas:", error);
    return {
      active: [],
      waiting: [],
      bot: []
    };
  }
};

/**
 * Busca mensagens de uma conversa
 */
export const fetchConversationMessages = async (conversationId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return [];
  }
};

/**
 * Envia uma nova mensagem
 */
export const sendMessage = async (conversationId: string, content: string, senderType: 'agent' | 'user' | 'bot') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user && senderType === 'agent') {
      throw new Error("Usuário não autenticado");
    }
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content,
        sender_id: senderType === 'agent' ? user!.id : conversationId,
        sender_type: senderType
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    throw error;
  }
};

/**
 * Finaliza um atendimento
 */
export const closeConversation = async (conversationId: string) => {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({
        status: 'closed',
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Erro ao finalizar conversa:", error);
    throw error;
  }
};

/**
 * Aceita um atendimento em espera
 */
export const acceptWaitingConversation = async (conversationId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Usuário não autenticado");
    }
    
    const { error } = await supabase
      .from('conversations')
      .update({
        status: 'active',
        agent_id: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('status', 'waiting');
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Erro ao aceitar conversa:", error);
    throw error;
  }
};
