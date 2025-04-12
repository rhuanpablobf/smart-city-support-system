
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
  serviceId: conversation.service_id,
  agentId: conversation.agent_id,
  status: conversation.status,
  createdAt: new Date(conversation.created_at),
  updatedAt: new Date(conversation.updated_at || conversation.created_at),
  lastMessageAt: new Date(conversation.last_message_at),
  inactivityWarnings: conversation.inactivity_warnings || 0,
  // Additional fields with departments/services relation data
  departmentName: conversation.departments?.name,
  serviceName: conversation.services?.name
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

    // Limpar conversas de clientes que desistiram (mais de 3 minutos sem atividade em espera)
    await cleanAbandonedWaitingConversations();

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
    
    // Buscar conversas sendo atendidas pelo bot (limitando a 100 para evitar problemas de performance)
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
      .limit(100);
      
    if (botError) throw botError;
    
    console.log("Conversas bot:", botConversations?.length || 0);
    
    return {
      active: activeConversations?.map(formatConversation) || [],
      waiting: waitingConversations?.map(formatConversation) || [],
      bot: botConversations?.map(formatConversation) || []
    };
  } catch (error) {
    console.error("Erro ao buscar conversas:", error);
    throw error;
  }
};

/**
 * Limpa conversas abandonadas em estado de espera
 */
const cleanAbandonedWaitingConversations = async () => {
  try {
    const threeMinutesAgo = new Date();
    threeMinutesAgo.setMinutes(threeMinutesAgo.getMinutes() - 3);
    
    // Marcar conversas abandonadas
    const { data, error } = await supabase
      .from('conversations')
      .update({ 
        status: 'abandoned',
        updated_at: new Date().toISOString()
      })
      .eq('status', 'waiting')
      .lt('last_message_at', threeMinutesAgo.toISOString())
      .select();
      
    if (error) {
      console.error("Erro ao limpar conversas abandonadas:", error);
    } else if (data && data.length > 0) {
      console.log(`${data.length} conversas marcadas como abandonadas`);
      
      // Registrar em relatório as conversas abandonadas
      for (const conversation of data) {
        await supabase
          .from('satisfaction_surveys')
          .insert({
            conversation_id: conversation.id,
            rating: 0,
            comment: "Cliente desistiu da fila"
          });
      }
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao limpar conversas abandonadas:", error);
    return false;
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
