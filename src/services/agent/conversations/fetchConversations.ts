import { supabase } from '@/integrations/supabase/client';
import { formatConversation } from '../utils/conversationFormatters';
import { cleanupAbandonedConversations } from '../cleanup/abandonedConversationsCleanup';

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
    await cleanupAbandonedConversations();

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

    if (activeError) {
      console.error("Erro ao buscar conversas ativas:", activeError);
      throw activeError;
    }
    
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
      
    if (waitingError) {
      console.error("Erro ao buscar conversas em espera:", waitingError);
      throw waitingError;
    }
    
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
      
    if (botError) {
      console.error("Erro ao buscar conversas atendidas pelo bot:", botError);
      throw botError;
    }
    
    console.log("Conversas ativas:", activeConversations?.length || 0);
    console.log("Conversas em espera:", waitingConversations?.length || 0);
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
