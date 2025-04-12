
import { supabase } from '@/integrations/supabase/client';

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
