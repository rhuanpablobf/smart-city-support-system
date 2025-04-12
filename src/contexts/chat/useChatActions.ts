
import { useState } from 'react';
import { ChatMessage, Conversation } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { 
  sendMessage as apiSendMessage,
  closeConversation as apiCloseConversation,
  fetchConversationMessages
} from '@/services/agent';
import { ConversationsData } from './types';

export const useChatActions = () => {
  const [conversations, setConversationsState] = useState<ConversationsData>({
    active: [],
    waiting: [],
    bot: []
  });
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const setConversations = (data: ConversationsData) => {
    setConversationsState(data);
    
    // Se tivermos uma conversa selecionada, atualize-a com os dados mais recentes
    if (currentConversation) {
      const allConvs = [...data.active, ...data.waiting, ...data.bot];
      const updated = allConvs.find(c => c.id === currentConversation.id);
      if (updated && updated !== currentConversation) {
        setCurrentConversation(updated);
      }
    }
  };

  const selectConversation = async (conversationId: string) => {
    setLoading(true);
    try {
      // Encontre a conversa em todas as categorias
      const allConversations = [
        ...conversations.active,
        ...conversations.waiting,
        ...conversations.bot
      ];
      
      const selected = allConversations.find(c => c.id === conversationId) || null;
      setCurrentConversation(selected);
      
      if (selected) {
        // Buscar mensagens da conversa do banco de dados
        const messagesData = await fetchConversationMessages(conversationId);
        setMessages(messagesData);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Erro ao selecionar conversa:", error);
      toast({
        title: "Erro ao carregar conversa",
        description: "Não foi possível carregar as mensagens. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    // Em uma aplicação real, isso criaria uma nova conversa no banco de dados
    toast({
      title: "Nova conversa",
      description: "Funcionalidade não implementada nesta demonstração",
    });
  };

  const sendMessage = async (content: string, attachments?: File[]) => {
    if (!currentConversation) return;
    
    setLoading(true);
    try {
      // Enviar mensagem para o banco de dados
      const newMessage = await apiSendMessage(currentConversation.id, content, 'agent');
      
      // Adicionar mensagem à lista local
      setMessages(prev => [...prev, newMessage]);
      
      // Atualizar a conversa para mostrar a hora da última mensagem
      const updatedConv = {
        ...currentConversation,
        lastMessageAt: new Date()
      };
      setCurrentConversation(updatedConv);
      
      // Atualizar a lista de conversas
      const updatedActive = conversations.active.map(c => 
        c.id === currentConversation.id ? updatedConv : c
      );
      
      setConversationsState({
        ...conversations,
        active: updatedActive
      });
      
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const transferChat = (agentId: string) => {
    if (!currentConversation) return;
    
    toast({
      title: "Transferência iniciada",
      description: "Funcionalidade não totalmente implementada nesta demonstração",
    });
  };

  const closeChat = async () => {
    if (!currentConversation) return;
    
    try {
      // Finalizar a conversa no banco de dados
      await apiCloseConversation(currentConversation.id);
      
      // Remover da lista de conversas ativas
      const updatedActive = conversations.active.filter(c => c.id !== currentConversation.id);
      
      setConversationsState({
        ...conversations,
        active: updatedActive
      });
      
      toast({
        title: "Conversa encerrada",
        description: "A conversa foi marcada como fechada",
      });
      
      // Limpar conversa atual
      setCurrentConversation(null);
      setMessages([]);
    } catch (error) {
      console.error("Erro ao fechar conversa:", error);
      toast({
        title: "Erro ao fechar conversa",
        description: "Não foi possível encerrar a conversa. Tente novamente.",
        variant: "destructive",
      });
    }
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
