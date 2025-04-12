
import { supabase } from '@/integrations/supabase/client';

/**
 * Limpa conversas abandonadas em espera (sem atividade por mais de 3 minutos)
 * e registra como abandonadas para estatísticas
 */
export const cleanAbandonedWaitingConversations = async () => {
  try {
    // Pegar timestamp de 3 minutos atrás
    const thresholdTime = new Date();
    thresholdTime.setMinutes(thresholdTime.getMinutes() - 3);
    const thresholdTimeIso = thresholdTime.toISOString();
    
    // Buscar conversas inativas (sem mensagens recentes)
    const { data: inactiveConversations, error } = await supabase
      .from('conversations')
      .select('id')
      .eq('status', 'waiting')
      .lt('last_message_at', thresholdTimeIso);
    
    if (error) throw error;
    
    // Se não houver conversas abandonadas, encerre
    if (!inactiveConversations || inactiveConversations.length === 0) {
      return;
    }
    
    console.log(`Encontradas ${inactiveConversations.length} conversas abandonadas`);
    
    // Registrar conversas abandonadas para estatísticas
    const abandonedIds = inactiveConversations.map(conv => conv.id);

    // Registrar o status de abandono nas conversas
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ status: 'abandoned' })
      .in('id', abandonedIds);
    
    if (updateError) throw updateError;
    
    console.log(`${inactiveConversations.length} conversas marcadas como abandonadas`);
  } catch (error) {
    console.error("Erro ao limpar conversas abandonadas:", error);
    throw error;
  }
};
