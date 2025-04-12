
import { useState, useCallback } from 'react';
import { Conversation } from '@/types';
import { useChatConversations } from './hooks/useChatConversations';
import { useChatMessages } from './hooks/useChatMessages';
import { useChatSelection } from './hooks/useChatSelection';
import { useChatOperations } from './hooks/useChatOperations';

export const useChatActions = () => {
  const {
    conversations,
    setConversations,
    currentConversation,
    setCurrentConversation,
    loadConversations
  } = useChatConversations();

  const {
    messages,
    setMessages,
    loading,
    loadMessages,
    sendMessage: sendChatMessage
  } = useChatMessages();

  const { 
    startNewChat, 
    transferChat 
  } = useChatSelection();

  const { 
    closeChat: closeChatOperation 
  } = useChatOperations(
    conversations, 
    setConversations, 
    setCurrentConversation, 
    setMessages
  );

  const selectConversation = async (conversationId: string) => {
    try {
      // Find the conversation in all categories
      const allConversations = [
        ...conversations.active,
        ...conversations.waiting,
        ...conversations.bot
      ];
      
      const selected = allConversations.find(c => c.id === conversationId) || null;
      setCurrentConversation(selected);
      
      if (selected) {
        await loadMessages(conversationId);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error selecting conversation:", error);
      // Error handling is done in the loadMessages function
    }
  };

  const sendMessage = async (content: string, attachments?: File[]) => {
    if (!currentConversation) return;
    
    try {
      const newMessage = await sendChatMessage(currentConversation, content, attachments);
      
      // Update the conversation to show the time of the last message
      const updatedConv = {
        ...currentConversation,
        lastMessageAt: new Date()
      };
      setCurrentConversation(updatedConv);
      
      // Update the conversations list
      const updatedActive = conversations.active.map(c => 
        c.id === currentConversation.id ? updatedConv : c
      );
      
      setConversations({
        ...conversations,
        active: updatedActive
      });
    } catch (error) {
      // Error handling is done in the sendChatMessage function
    }
  };

  const closeChat = async () => {
    if (!currentConversation) return;
    await closeChatOperation(currentConversation);
  };

  return {
    conversations,
    setConversations,
    currentConversation,
    setCurrentConversation,
    messages,
    setMessages,
    loading,
    selectConversation,
    startNewChat,
    sendMessage,
    transferChat,
    closeChat
  };
};
