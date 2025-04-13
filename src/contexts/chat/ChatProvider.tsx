
import React, { ReactNode, useEffect, useState } from 'react';
import ChatContext from './ChatContext';
import { useChatActions } from './useChatActions';
import { fetchAgentConversations } from '@/services/agent';
import { realtimeService } from '@/services/realtime/realtimeService';

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

  // Load conversations from API - only once on initial mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await fetchAgentConversations();
        setConversations({
          active: data.active || [],
          waiting: data.waiting || [],
          bot: data.bot || []
        });
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };

    loadConversations();
    
    // Set up realtime subscriptions for conversations
    const ids = realtimeService.subscribeToTables(
      ['conversations', 'messages'],
      '*',
      async (payload) => {
        // Only reload data when relevant changes occur
        const conversationUpdated = payload.table === 'conversations';
        const messageUpdated = payload.table === 'messages' && payload.new?.conversation_id;
        
        if (conversationUpdated || messageUpdated) {
          console.log('Realtime update triggered for conversations');
          // Use a debounced reload to prevent multiple calls
          await loadConversations();
          
          // If current conversation has new messages, update them
          if (currentConversation && messageUpdated && 
              payload.new.conversation_id === currentConversation.id) {
            // Refresh messages for current conversation
            // This will be handled by the message subscription in useChatMessages
          }
        }
      }
    );
    
    setChannelIds(ids);

    return () => {
      // Clean up realtime subscriptions
      realtimeService.unsubscribeAll(ids);
    };
  }, []);

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
