
import React, { ReactNode, useEffect, useState, useCallback } from 'react';
import ChatContext from './ChatContext';
import { useChatActions } from './useChatActions';
import { fetchAgentConversations } from '@/services/agent';
import { realtimeService } from '@/services/realtime/realtimeService';
import { useAuth } from '@/contexts/auth';

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const {
    conversations,
    setConversations,
    currentConversation,
    messages,
    loading,
    selectConversation,
    startNewChat,
    sendMessage,
    transferChat,
    closeChat
  } = useChatActions();
  
  const [channelIds, setChannelIds] = useState<string[]>([]);
  const { currentUser } = useAuth();

  // Load conversations from API - only once on initial mount
  const loadConversations = useCallback(async () => {
    try {
      if (!currentUser?.id) {
        console.log("Não foi possível carregar conversas: Usuário não autenticado");
        return;
      }

      console.log("Loading conversations for user:", currentUser.id);
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
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, [currentUser, setConversations]);

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
                               typeof payload.new === 'object' && 
                               'conversation_id' in payload.new;
          
          if (conversationUpdated || messageUpdated) {
            console.log('Realtime update triggered for conversations', payload);
            
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
    loading,
    sendMessage,
    selectConversation,
    startNewChat,
    transferChat,
    closeChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
