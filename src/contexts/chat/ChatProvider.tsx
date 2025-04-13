
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
      console.log("Loading conversations for user:", currentUser?.id);
      const data = await fetchAgentConversations(currentUser?.id);
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
    // Only setup subscriptions when we have a current user
    if (currentUser?.id) {
      loadConversations();
      
      // Set up realtime subscriptions for conversations and messages
      const ids = realtimeService.subscribeToTables(
        ['conversations', 'messages'],
        '*',
        async (payload) => {
          // React to relevant changes
          const conversationUpdated = payload.table === 'conversations';
          const messageUpdated = payload.table === 'messages' && payload.new?.conversation_id;
          
          if (conversationUpdated || messageUpdated) {
            console.log('Realtime update triggered for conversations', payload);
            
            // Only reload if it's a relevant update (status change, new message in current conversation)
            if (conversationUpdated && 
                payload.new?.status !== payload.old?.status) {
              console.log('Status changed, reloading conversations');
              await loadConversations();
            } else if (messageUpdated) {
              // If it's just a new message, we might want to update just that conversation
              // For simplicity, reload all for now
              await loadConversations();
            }
          }
        }
      );
      
      setChannelIds(ids);
    }

    return () => {
      // Clean up realtime subscriptions
      if (channelIds.length > 0) {
        realtimeService.unsubscribeAll(channelIds);
      }
    };
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
