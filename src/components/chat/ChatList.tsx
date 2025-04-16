
import React, { useState, useEffect, useCallback } from 'react';
import { useChat } from '@/contexts/chat';
import { useToast } from '@/components/ui/use-toast';
import { useConversationSearch } from '@/hooks/useConversationSearch';
import SearchInput from './list/SearchInput';
import ConversationTabs from './list/ConversationTabs';
import { useAuth } from '@/contexts/auth';
import { acceptWaitingConversation } from '@/services/agent/conversations/manageConversations';

const ChatList = () => {
  const { 
    conversations, 
    setConversations,
    currentConversation, 
    selectConversation, 
    startNewChat,
    refreshConversations
  } = useChat();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Custom hook to handle conversation filtering
  const { searchTerm, setSearchTerm, filteredConversations } = useConversationSearch(
    conversations.active || [],
    conversations.waiting || [],
    conversations.bot || []
  );

  // Reset loading status after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Accept a waiting conversation
  const handleAcceptWaiting = async (conversationId: string) => {
    try {
      setLoading(true);
      
      // Try to accept the waiting conversation
      const success = await acceptWaitingConversation(conversationId);
      
      if (success) {
        // Select the accepted conversation immediately
        selectConversation(conversationId);
        
        toast({
          title: "Conversa aceita",
          description: "Você está agora atendendo esta conversa.",
          variant: "default"
        });
        
        // Reload conversations to reflect the change
        await refreshConversations();
      } else {
        throw new Error("Não foi possível aceitar a conversa");
      }
    } catch (error: any) {
      console.error("Erro ao aceitar conversa:", error);
      toast({
        title: "Erro ao aceitar conversa",
        description: error.message || "Não foi possível aceitar a conversa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      setLoading(true);
      await refreshConversations();
      toast({
        title: "Atualizado",
        description: "Lista de conversas atualizada.",
      });
    } catch (error) {
      console.error("Error refreshing conversations:", error);
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
        onRefresh={handleRefresh}
      />
      
      {loadError ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <p className="text-red-600 mb-4">{loadError}</p>
          <button 
            onClick={handleRefresh} 
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
