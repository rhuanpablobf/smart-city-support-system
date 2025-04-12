
import { useState } from 'react';
import { ChatMessage, Conversation } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { fetchConversationMessages, sendMessage as apiSendMessage } from '@/services/agent';

export const useChatMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const loadMessages = async (conversationId: string) => {
    setLoading(true);
    try {
      // Fetch conversation messages from the database
      const messagesData = await fetchConversationMessages(conversationId);
      setMessages(messagesData);
      return messagesData;
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (
    conversation: Conversation, 
    content: string, 
    attachments?: File[]
  ) => {
    setLoading(true);
    try {
      // Send message to the database
      const newMessage = await apiSendMessage(conversation.id, content, 'agent');
      
      // Add message to the local list
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar sua mensagem. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    setMessages,
    loading,
    loadMessages,
    sendMessage,
  };
};
