import { supabase } from '@/integrations/supabase/client';
import { ConversationStatus } from '@/types';

export const countActiveAgents = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');

    if (error) {
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error counting active agents:', error);
    return 0;
  }
};

export const countWaitingConversations = async (): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'waiting');
  
      if (error) {
        throw error;
      }
  
      return count || 0;
    } catch (error) {
      console.error('Error counting waiting conversations:', error);
      return 0;
    }
  };

export const countOpenConversations = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');

    if (error) {
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error counting open conversations:', error);
    return 0;
  }
};

// Update the countConversationsByStatus function to handle 'completed' and 'abandoned'
export const countConversationsByStatus = async (status: ConversationStatus | 'completed' | 'abandoned'): Promise<number> => {
  try {
    let query = supabase.from('conversations').select('id', { count: 'exact', head: true });
    
    // Handle completed conversations (which are marked as 'closed' in the database)
    if (status === 'completed') {
      query = query.eq('status', 'closed' as ConversationStatus);
    } 
    // Handle all other statuses normally
    else {
      query = query.eq('status', status as ConversationStatus);
    }
    
    const { count, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return count || 0;
  } catch (error) {
    console.error(`Error counting conversations with status ${status}:`, error);
    return 0;
  }
};

// Update getCompletedToday function
export const getCompletedToday = async (): Promise<number> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count, error } = await supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'closed' as ConversationStatus)
      .gte('updated_at', today.toISOString());
    
    if (error) {
      throw error;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error getting completed conversations today:', error);
    return 0;
  }
};

// Update getAbandonedConversations function
export const getAbandonedConversations = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'abandoned' as ConversationStatus);
    
    if (error) {
      throw error;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error getting abandoned conversations:', error);
    return 0;
  }
};
