
import { useState } from 'react';
import { Conversation } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { fetchAgentConversations } from '@/services/agent';
import { ConversationsData } from '../types';

export const useChatConversations = () => {
  const [conversations, setConversationsState] = useState<ConversationsData>({
    active: [],
    waiting: [],
    bot: []
  });
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const { toast } = useToast();

  const setConversations = (data: ConversationsData) => {
    setConversationsState(data);
    
    // If we have a selected conversation, update it with the latest data
    if (currentConversation) {
      const allConvs = [...data.active, ...data.waiting, ...data.bot];
      const updated = allConvs.find(c => c.id === currentConversation.id);
      if (updated && updated !== currentConversation) {
        setCurrentConversation(updated);
      }
    }
  };

  const loadConversations = async () => {
    try {
      const data = await fetchAgentConversations();
      setConversations({
        active: data.active || [],
        waiting: data.waiting || [],
        bot: data.bot || []
      });
      return data;
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Erro ao carregar conversas",
        description: "Não foi possível carregar as conversas. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    conversations,
    setConversations,
    currentConversation,
    setCurrentConversation,
    loadConversations,
  };
};
