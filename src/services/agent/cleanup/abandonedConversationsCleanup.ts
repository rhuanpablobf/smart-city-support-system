import { supabase } from '@/integrations/supabase/client';
import { ConversationStatus } from '@/types';

// Function to check and update abandoned conversations
export const cleanupAbandonedConversations = async () => {
  try {
    // Define the threshold for inactivity (e.g., 30 minutes)
    const inactivityThreshold = 30 * 60 * 1000; // 30 minutes in milliseconds
    const now = new Date();
    const cutoff = new Date(now.getTime() - inactivityThreshold);

    // Query for conversations that are active but have no recent messages
    const { data: activeConversations, error } = await supabase
      .from('conversations')
      .select('id, updated_at')
      .eq('status', 'active')
      .lt('updated_at', cutoff.toISOString());

    if (error) {
      console.error('Error fetching active conversations:', error);
      return;
    }

    if (!activeConversations || activeConversations.length === 0) {
      console.log('No abandoned conversations found.');
      return;
    }

    // Process each abandoned conversation
    for (const conversation of activeConversations) {
      await updateConversationStatus(conversation.id);
    }
  } catch (error) {
    console.error('Error during abandoned conversations cleanup:', error);
  }
};

const updateConversationStatus = async (conversationId: string) => {
  try {
    // Update conversation status to abandoned
    await supabase
      .from('conversations')
      .update({ 
        status: 'abandoned' as ConversationStatus
      })
      .eq('id', conversationId);
      
    console.log(`Conversation ${conversationId} marked as abandoned due to inactivity`);
  } catch (error) {
    console.error(`Error updating conversation ${conversationId} status:`, error);
  }
};

// Schedule the cleanup task (e.g., every hour)
const interval = 60 * 60 * 1000; // 1 hour in milliseconds
setInterval(cleanupAbandonedConversations, interval);
