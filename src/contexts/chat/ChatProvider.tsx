
import React, { ReactNode, useEffect } from 'react';
import ChatContext from './ChatContext';
import { useChatActions } from './useChatActions';
import { fetchAgentConversations } from '@/services/agent';

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
    // Not adding dependencies here to avoid reloading on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
