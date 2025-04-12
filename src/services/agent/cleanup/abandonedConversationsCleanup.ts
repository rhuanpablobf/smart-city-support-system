
import { supabase } from '@/integrations/supabase/client';
import { ConversationStatus } from '@/types';
import { formatConversation } from '../utils/conversationFormatters';

/**
 * Clean up abandoned conversations (conversations where no agent replied)
 */
export const cleanupAbandonedConversations = async () => {
  try {
    // Find conversations that are waiting for response for more than 15 minutes
    const thresholdTime = new Date();
    thresholdTime.setMinutes(thresholdTime.getMinutes() - 15); 
    
    // Find waiting conversations that haven't been updated in a while
    const { data: waitingConversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        created_at,
        updated_at,
        status,
        service_id,
        department_id,
        services (name),
        departments (name),
        user_id,
        agent_id,
        user_cpf,
        last_message_at
      `)
      .eq('status', 'waiting')
      .lt('updated_at', thresholdTime.toISOString());
    
    if (error) {
      console.error('Error fetching abandoned conversations:', error);
      return [];
    }
    
    // Mark these conversations as abandoned
    if (waitingConversations && waitingConversations.length > 0) {
      const abandonedIds = waitingConversations.map(c => c.id);
      
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ 
          status: 'abandoned', 
          updated_at: new Date().toISOString() 
        })
        .in('id', abandonedIds);
      
      if (updateError) {
        console.error('Error marking conversations as abandoned:', updateError);
      }
    }
    
    return waitingConversations ? waitingConversations.map(formatConversation) : [];
  } catch (error) {
    console.error('Error in cleanup abandoned conversations:', error);
    return [];
  }
};
