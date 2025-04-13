
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
      
      if (!user) {
        console.error("Não foi possível obter o usuário atual");
        return { active: [], waiting: [], bot: [] };
      }
    }

    console.log("Fetching conversations for agent:", agentId);

    // Limpar conversas de clientes que desistiram (mais de 15 minutos sem atividade em espera)
    try {
      await cleanupAbandonedConversations();
    } catch (cleanupError) {
      console.error("Error cleaning up abandoned conversations:", cleanupError);
      // Continue execution even if cleanup fails
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

    if (activeError) {
      console.error("Erro ao buscar conversas ativas:", activeError);
      throw activeError;
    }
    
    // Buscar todas as conversas em espera, independentemente do agente
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
    
    // Buscar conversas sendo atendidas pelo bot (limitando a 50 para melhorar performance)
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
      .limit(50);
      
    if (botError) {
      console.error("Erro ao buscar conversas atendidas pelo bot:", botError);
      throw botError;
    }
    
    console.log("Conversas ativas:", activeConversations?.length || 0);
    console.log("Conversas em espera:", waitingConversations?.length || 0);
    console.log("Conversas bot:", botConversations?.length || 0);
    
    // Ensure we always return arrays, even if Supabase returns null
    return {
      active: Array.isArray(activeConversations) ? activeConversations.map(formatConversation) : [],
      waiting: Array.isArray(waitingConversations) ? waitingConversations.map(formatConversation) : [],
      bot: Array.isArray(botConversations) ? botConversations.map(formatConversation) : []
    };
  } catch (error) {
    console.error("Erro ao buscar conversas:", error);
    // Even on error, return empty arrays to prevent UI crashes
    return { active: [], waiting: [], bot: [] };
  }
};
