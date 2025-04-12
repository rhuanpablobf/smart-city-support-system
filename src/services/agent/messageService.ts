
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types';

/**
 * Helper to format message data
 */
const formatMessage = (message: any): ChatMessage => ({
  id: message.id,
  conversation_id: message.conversation_id,
  content: message.content,
  sender_id: message.sender_id,
  type: message.sender_type, // Changed from senderType to type
  timestamp: message.timestamp,
  read: message.read
});

/**
 * Busca mensagens de uma conversa
 */
export const fetchConversationMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });
      
    if (error) throw error;
    
    return data?.map(formatMessage) || [];
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return [];
  }
};

/**
 * Envia uma nova mensagem
 */
export const sendMessage = async (conversationId: string, content: string, senderType: 'agent' | 'user' | 'bot'): Promise<ChatMessage> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user && senderType === 'agent') {
      throw new Error("Usuário não autenticado");
    }
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content,
        sender_id: senderType === 'agent' ? user!.id : conversationId,
        sender_type: senderType
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return formatMessage(data);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    throw error;
  }
};
