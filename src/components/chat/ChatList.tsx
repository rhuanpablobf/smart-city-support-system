
import React, { useState, useEffect, useCallback } from 'react';
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const { toast } = useToast();

  // Custom hook to handle conversation filtering
  const { searchTerm, setSearchTerm, filteredConversations } = useConversationSearch(
    conversations.active || [],
    conversations.waiting || [],
    conversations.bot || []
  );

  // Load conversations only once on component mount
  // Real-time updates will be handled by ChatProvider
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await fetchAgentConversations();
      
      // Update chat context with loaded conversations
      setConversations({
        active: data.active || [],
        waiting: data.waiting || [],
        bot: data.bot || []
      });
      
      console.log("Conversas carregadas manualmente:", {
        active: data.active?.length || 0,
        waiting: data.waiting?.length || 0,
        bot: data.bot?.length || 0
      });
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
      setLoadError("Falha ao carregar conversas");
      toast({
        title: "Erro ao carregar conversas",
        description: "Não foi possível carregar as conversas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, setConversations]);

  useEffect(() => {
    // Load conversations only once on mount
    loadConversations();
    // Polling removed - now using realtime updates via ChatProvider
  }, [loadConversations]);

  // Accept a waiting conversation
  const handleAcceptWaiting = async (conversationId: string) => {
    try {
      setLoading(true);
      await acceptWaitingConversation(conversationId);
      
      // Select the accepted conversation immediately
      selectConversation(conversationId);
      
      toast({
        title: "Conversa aceita",
        description: "Você está agora atendendo esta conversa.",
        variant: "default"
      });
      
      // No need to reload - realtime will handle that
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

  // Função para tentar recarregar quando houver erro
  const handleRetryLoad = () => {
    loadConversations();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      <SearchInput 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        onNewChat={startNewChat} 
      />
      
      {loadError ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <p className="text-red-600 mb-4">{loadError}</p>
          <button 
            onClick={handleRetryLoad} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <ConversationTabs 
          activeConversations={filteredConversations.active}
          waitingConversations={filteredConversations.waiting}
          botConversations={filteredConversations.bot}
          currentConversation={currentConversation}
          onSelectConversation={selectConversation}
          onAcceptWaiting={handleAcceptWaiting}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default ChatList;
