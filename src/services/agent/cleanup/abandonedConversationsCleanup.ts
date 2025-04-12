
import { supabase } from '@/integrations/supabase/client';

/**
 * Limpa conversas abandonadas em estado de espera
 */
export const cleanAbandonedWaitingConversations = async () => {
  try {
    const threeMinutesAgo = new Date();
    threeMinutesAgo.setMinutes(threeMinutesAgo.getMinutes() - 3);
    
    // Marcar conversas abandonadas
    const { data, error } = await supabase
      .from('conversations')
      .update({ 
        status: 'closed',  // Using 'closed' status which is in the enum
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
