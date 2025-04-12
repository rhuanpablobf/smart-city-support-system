
import { useCallback } from 'react';
import { Conversation } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { closeConversation as apiCloseConversation } from '@/services/agent';
import { ConversationsData } from '../types';

export const useChatOperations = (
  conversations: ConversationsData, 
  setConversations: (data: ConversationsData) => void,
  setCurrentConversation: (conversation: Conversation | null) => void,
  setMessages: (messages: any[]) => void
) => {
  const { toast } = useToast();

  const closeChat = useCallback(async (conversation: Conversation) => {
    try {
      // Close the conversation in the database
      await apiCloseConversation(conversation.id);
      
      // Remove from the active conversations list
      const updatedActive = conversations.active.filter(c => c.id !== conversation.id);
      
      setConversations({
        ...conversations,
        active: updatedActive
      });
      
      toast({
        title: "Conversa encerrada",
        description: "A conversa foi marcada como fechada",
      });
      
      // Clear current conversation and messages
      setCurrentConversation(null);
      setMessages([]);
      
      return true;
    } catch (error) {
      console.error("Error closing conversation:", error);
      toast({
        title: "Erro ao fechar conversa",
        description: "Não foi possível encerrar a conversa. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  }, [conversations, setConversations, setCurrentConversation, setMessages, toast]);

  return {
    closeChat,
  };
};
