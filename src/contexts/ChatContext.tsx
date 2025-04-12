
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ChatMessage, Conversation, User } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  loading: boolean;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  selectConversation: (conversationId: string) => void;
  startNewChat: () => void;
  transferChat: (agentId: string) => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

// Mock data for demonstration purposes
const mockConversations: Conversation[] = [
  {
    id: '1',
    userId: 'user1',
    userCpf: '123.456.789-00',
    departmentId: 'health',
    serviceId: 'vaccination',
    agentId: '3',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(),
    lastMessageAt: new Date(),
    inactivityWarnings: 0,
  },
  {
    id: '2',
    userId: 'user2',
    userCpf: '987.654.321-00',
    departmentId: 'education',
    status: 'waiting',
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(),
    lastMessageAt: new Date(Date.now() - 1800000),
    inactivityWarnings: 1,
  },
];

const mockMessages: Record<string, ChatMessage[]> = {
  '1': [
    {
      id: 'm1',
      conversationId: '1',
      senderId: 'bot',
      senderType: 'bot',
      content: 'Olá! Por favor, informe seu CPF para iniciarmos o atendimento.',
      timestamp: new Date(Date.now() - 3600000),
      read: true,
    },
    {
      id: 'm2',
      conversationId: '1',
      senderId: 'user1',
      senderType: 'user',
      content: '123.456.789-00',
      timestamp: new Date(Date.now() - 3570000),
      read: true,
    },
    {
      id: 'm3',
      conversationId: '1',
      senderId: 'bot',
      senderType: 'bot',
      content: 'Obrigado! Para qual secretaria deseja atendimento?',
      timestamp: new Date(Date.now() - 3540000),
      read: true,
    },
    {
      id: 'm4',
      conversationId: '1',
      senderId: 'user1',
      senderType: 'user',
      content: 'Secretaria de Saúde',
      timestamp: new Date(Date.now() - 3510000),
      read: true,
    },
    {
      id: 'm5',
      conversationId: '1',
      senderId: 'bot',
      senderType: 'bot',
      content: 'Qual serviço você precisa?',
      timestamp: new Date(Date.now() - 3480000),
      read: true,
    },
    {
      id: 'm6',
      conversationId: '1',
      senderId: 'user1',
      senderType: 'user',
      content: 'Informações sobre vacinação',
      timestamp: new Date(Date.now() - 3450000),
      read: true,
    },
    {
      id: 'm7',
      conversationId: '1',
      senderId: 'bot',
      senderType: 'bot',
      content: 'Transferindo para um atendente especializado...',
      timestamp: new Date(Date.now() - 3420000),
      read: true,
    },
    {
      id: 'm8',
      conversationId: '1',
      senderId: '3',
      senderType: 'agent',
      content: 'Olá! Sou o Agente Carlos. Como posso ajudar com informações sobre vacinação?',
      timestamp: new Date(Date.now() - 3390000),
      read: true,
    },
  ],
  '2': [
    {
      id: 'm9',
      conversationId: '2',
      senderId: 'bot',
      senderType: 'bot',
      content: 'Olá! Por favor, informe seu CPF para iniciarmos o atendimento.',
      timestamp: new Date(Date.now() - 7200000),
      read: true,
    },
    {
      id: 'm10',
      conversationId: '2',
      senderId: 'user2',
      senderType: 'user',
      content: '987.654.321-00',
      timestamp: new Date(Date.now() - 7170000),
      read: true,
    },
    {
      id: 'm11',
      conversationId: '2',
      senderId: 'bot',
      senderType: 'bot',
      content: 'Obrigado! Para qual secretaria deseja atendimento?',
      timestamp: new Date(Date.now() - 7140000),
      read: true,
    },
    {
      id: 'm12',
      conversationId: '2',
      senderId: 'user2',
      senderType: 'user',
      content: 'Secretaria de Educação',
      timestamp: new Date(Date.now() - 7110000),
      read: true,
    },
    {
      id: 'm13',
      conversationId: '2',
      senderId: 'bot',
      senderType: 'bot',
      content: 'Aguarde um momento enquanto encontramos um atendente disponível...',
      timestamp: new Date(Date.now() - 7080000),
      read: true,
    },
  ],
};

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const selectConversation = (conversationId: string) => {
    const selected = conversations.find(c => c.id === conversationId) || null;
    setCurrentConversation(selected);
    
    if (selected) {
      // In a real app, this would fetch messages from an API
      setMessages(mockMessages[conversationId] || []);
    } else {
      setMessages([]);
    }
  };

  const startNewChat = () => {
    // In a real app, this would create a new conversation in the backend
    toast({
      title: "New chat",
      description: "Feature not implemented in this demo",
    });
  };

  const sendMessage = async (content: string, attachments?: File[]) => {
    if (!currentConversation) return;
    
    setLoading(true);
    try {
      // In a real app, this would send the message to an API
      const newMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversationId: currentConversation.id,
        senderId: 'agent-id', // This would come from auth context
        senderType: 'agent',
        content,
        timestamp: new Date(),
        read: false,
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Simulate response delay
      await new Promise(r => setTimeout(r, 1000));
      
      // Simulate auto-response for demo
      if (currentConversation.id === '1') {
        const responseMessage: ChatMessage = {
          id: `resp-${Date.now()}`,
          conversationId: currentConversation.id,
          senderId: 'user1',
          senderType: 'user',
          content: 'Obrigado pela informação!',
          timestamp: new Date(),
          read: false,
        };
        setMessages(prev => [...prev, responseMessage]);
      }
      
      // Update conversation last message time
      setConversations(prev => 
        prev.map(c => 
          c.id === currentConversation.id 
            ? { ...c, lastMessageAt: new Date(), updatedAt: new Date() } 
            : c
        )
      );
      
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Could not send your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const transferChat = (agentId: string) => {
    if (!currentConversation) return;
    
    toast({
      title: "Transfer initiated",
      description: "Chat transfer feature not fully implemented in this demo",
    });
  };

  const closeChat = () => {
    if (!currentConversation) return;
    
    // In a real app, this would update the conversation status in the backend
    setConversations(prev => 
      prev.map(c => 
        c.id === currentConversation.id 
          ? { ...c, status: 'closed' as const, updatedAt: new Date() } 
          : c
      )
    );
    
    toast({
      title: "Chat closed",
      description: "The conversation has been marked as closed",
    });
    
    // Clear current conversation
    setCurrentConversation(null);
    setMessages([]);
  };

  useEffect(() => {
    // In a real app, this would fetch conversations from an API
    // This is just for demo purposes
  }, []);

  const value = {
    conversations,
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

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === null) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
