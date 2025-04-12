
import { useState, useMemo } from 'react';
import { Conversation } from '@/types';

export const useConversationSearch = (
  activeConversations: Conversation[],
  waitingConversations: Conversation[],
  botConversations: Conversation[]
) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = useMemo(() => {
    const filterBySearchTerm = (convs: Conversation[]) => {
      if (!searchTerm) return convs;
      
      return convs.filter(c => 
        c.userCpf?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    };

    return {
      active: filterBySearchTerm(activeConversations),
      waiting: filterBySearchTerm(waitingConversations),
      bot: filterBySearchTerm(botConversations)
    };
  }, [activeConversations, waitingConversations, botConversations, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredConversations
  };
};
