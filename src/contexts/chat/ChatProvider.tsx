
import React, { ReactNode, useEffect, useState, useCallback } from 'react';
import ChatContext from './ChatContext';
import { useChatActions } from './useChatActions';
import { fetchAgentConversations } from '@/services/agent';
import { realtimeService } from '@/services/realtime/realtimeService';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/components/ui/use-toast';

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const {
    conversations,
    setConversations,
    currentConversation,
    messages,
    loading: actionsLoading,
    selectConversation,
    startNewChat,
    sendMessage,
    transferChat,
    closeChat
  } = useChatActions();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [channelIds, setChannelIds] = useState<string[]>([]);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Load conversations from API - only once on initial mount
  const loadConversations = useCallback(async () => {
    try {
      if (!currentUser?.id) {
        console.log("Não foi possível carregar conversas: Usuário não autenticado");
        return;
      }

      console.log("Loading conversations for user:", currentUser.id);
      setLoading(true);
      const data = await fetchAgentConversations(currentUser.id);
      
      console.log("Conversations loaded:", {
        active: data.active?.length || 0,
        waiting: data.waiting?.length || 0,
        bot: data.bot?.length || 0
      });
      
      setConversations({
        active: data.active || [],
        waiting: data.waiting || [],
        bot: data.bot || []
      });
      
      return data;
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Erro ao carregar conversas",
        description: error.message || "Não foi possível carregar as conversas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, setConversations, toast]);

  useEffect(() => {
    // Clean up function to unsubscribe all channels
    const cleanupChannels = () => {
      if (channelIds.length > 0) {
        console.log("Cleaning up channels:", channelIds);
        realtimeService.unsubscribeAll(channelIds);
        setChannelIds([]);
      }
    };

    // Only setup subscriptions when we have a current user
    if (currentUser?.id) {
      // Initial load of conversations
      loadConversations();
      
      // Set up realtime subscriptions for conversations and messages
      const ids = realtimeService.subscribeToTables(
        ['conversations', 'messages'],
        '*',
        async (payload) => {
          // React to relevant changes
          const conversationUpdated = payload.table === 'conversations';
          const messageUpdated = payload.new && 
                               'conversation_id' in payload.new;
          
          if (conversationUpdated || messageUpdated) {
            console.log('Realtime update triggered for conversations', {
              table: payload.table,
              event: payload.eventType,
              id: payload.new && 'id' in payload.new ? payload.new.id : null
            });
            
            // Reload all conversations to ensure we have the latest data
            await loadConversations();
          }
        }
      );
      
      setChannelIds(ids);
    }

    // Return cleanup function
    return cleanupChannels;
  }, [currentUser, loadConversations]);

  const value = {
    conversations,
    setConversations,
    currentConversation,
    messages,
    loading: loading || actionsLoading, // Combine loading states
    sendMessage,
    selectConversation,
    startNewChat,
    transferChat,
    closeChat,
    refreshConversations: loadConversations
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
