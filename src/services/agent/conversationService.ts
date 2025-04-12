
import { supabase } from '@/integrations/supabase/client';
import { Conversation } from '@/types';

/**
 * Helper to format conversation data
 */
const formatConversation = (conversation: any): Conversation => ({
  id: conversation.id,
  userId: conversation.user_id || null,
  userCpf: conversation.user_cpf,
  departmentId: conversation.department_id,
  departmentName: conversation.departments?.name,
  serviceId: conversation.service_id,
  serviceName: conversation.services?.name,
  agentId: conversation.agent_id,
  status: conversation.status,
  createdAt: new Date(conversation.created_at),
  updatedAt: new Date(conversation.updated_at || conversation.created_at),
  lastMessageAt: new Date(conversation.last_message_at),
  inactivityWarnings: conversation.inactivity_warnings || 0,
});

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
        user_id,
        department_id,
        service_id,
        status,
        last_message_at,
        created_at,
        updated_at,
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
        user_id,
        department_id,
        service_id,
        status,
        last_message_at,
        created_at,
        updated_at,
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
        user_id,
        department_id,
        service_id,
        status,
        last_message_at,
        created_at,
        updated_at,
        departments(name),
        services(name)
      `)
      .eq('status', 'bot')
      .order('last_message_at', { ascending: false })
      .limit(20);
      
    if (botError) throw botError;
    
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
