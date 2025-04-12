
import React, { useState, useEffect } from 'react';
import { useChat } from '@/contexts/chat';
import { useToast } from '@/components/ui/use-toast';
import { fetchAgentConversations, acceptWaitingConversation } from '@/services/agent';
import { useConversationSearch } from '@/hooks/useConversationSearch';
import SearchInput from './list/SearchInput';
import ConversationTabs from './list/ConversationTabs';

const ChatList = () => {
  const { 
    conversations, 
    setConversations,
    currentConversation, 
    selectConversation, 
    startNewChat 
  } = useChat();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Custom hook to handle conversation filtering
  const { searchTerm, setSearchTerm, filteredConversations } = useConversationSearch(
    conversations.active || [],
    conversations.waiting || [],
    conversations.bot || []
  );

  // Load conversations from database
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const data = await fetchAgentConversations();
        
        // Update chat context with loaded conversations
        setConversations({
          active: data.active || [],
          waiting: data.waiting || [],
          bot: data.bot || []
        });
        
        console.log("Conversas carregadas:", {
          active: data.active?.length || 0,
          waiting: data.waiting?.length || 0,
          bot: data.bot?.length || 0
        });
      } catch (error) {
        console.error("Erro ao carregar conversas:", error);
        toast({
          title: "Erro ao carregar conversas",
          description: "Não foi possível carregar as conversas. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadConversations();
    
    // Update conversations every 10 seconds
    const interval = setInterval(loadConversations, 10000);
    
    return () => clearInterval(interval);
  }, [toast, setConversations]);

  // Accept a waiting conversation
  const handleAcceptWaiting = async (conversationId: string) => {
    try {
      setLoading(true);
      await acceptWaitingConversation(conversationId);
      
      // Reload conversations to reflect the change
      const data = await fetchAgentConversations();
      setConversations({
        active: data.active,
        waiting: data.waiting,
        bot: data.bot
      });
      
      // Select the accepted conversation
      selectConversation(conversationId);
      
      toast({
        title: "Conversa aceita",
        description: "Você está agora atendendo esta conversa.",
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao aceitar conversa:", error);
      toast({
        title: "Erro ao aceitar conversa",
        description: "Não foi possível aceitar a conversa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      <SearchInput 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        onNewChat={startNewChat} 
      />
      
      <ConversationTabs 
        activeConversations={filteredConversations.active}
        waitingConversations={filteredConversations.waiting}
        botConversations={filteredConversations.bot}
        currentConversation={currentConversation}
        onSelectConversation={selectConversation}
        onAcceptWaiting={handleAcceptWaiting}
        isLoading={loading}
      />
    </div>
  );
};

export default ChatList;
