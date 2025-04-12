
import React, { useState, useEffect } from 'react';
import { useChat } from '@/contexts/chat';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquarePlus, Bot, User, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchAgentConversations, acceptWaitingConversation } from '@/services/agent';
import { useToast } from '@/components/ui/use-toast';

const ChatList = () => {
  const { 
    conversations, 
    setConversations,
    currentConversation, 
    selectConversation, 
    startNewChat 
  } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar conversas do banco de dados
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const data = await fetchAgentConversations();
        
        // Atualizar o contexto de chat com as conversas carregadas
        setConversations({
          active: data.active,
          waiting: data.waiting,
          bot: data.bot
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
    
    // Atualizar conversas a cada 10 segundos
    const interval = setInterval(loadConversations, 10000);
    
    return () => clearInterval(interval);
  }, [toast, setConversations]);

  // Filtrar conversas com base no termo de pesquisa
  const filterConversations = (convs: any[]) => {
    if (!searchTerm) return convs;
    
    return convs.filter(c => 
      c.userCpf?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Aceitar uma conversa em espera
  const handleAcceptWaiting = async (conversationId: string) => {
    try {
      await acceptWaitingConversation(conversationId);
      
      // Recarregar conversas para refletir a mudança
      const data = await fetchAgentConversations();
      setConversations({
        active: data.active,
        waiting: data.waiting,
        bot: data.bot
      });
      
      // Selecionar a conversa aceita
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
    }
  };

  // Filter conversations based on status
  const activeConversations = filterConversations(conversations.active || []);
  const waitingConversations = filterConversations(conversations.waiting || []);
  const botConversations = filterConversations(conversations.bot || []);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      <div className="p-3 flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Buscar conversa..." 
            className="h-9 pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          onClick={startNewChat}
          variant="outline" 
          size="icon"
          className="h-9 w-9 flex-shrink-0"
        >
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs defaultValue="active" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-3 mx-3">
          <TabsTrigger value="active" className="relative">
            Ativos
            {activeConversations.length > 0 && (
              <Badge 
                variant="outline" 
                className="ml-2 h-5 min-w-5 flex items-center justify-center p-0 bg-blue-100 text-blue-800 border-blue-200"
              >
                {activeConversations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="waiting" className="relative">
            Espera
            {waitingConversations.length > 0 && (
              <Badge 
                variant="outline" 
                className="ml-2 h-5 min-w-5 flex items-center justify-center p-0 bg-yellow-100 text-yellow-800 border-yellow-200"
              >
                {waitingConversations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bot" className="relative">
            Bot
            {botConversations.length > 0 && (
              <Badge 
                variant="outline" 
                className="ml-2 h-5 min-w-5 flex items-center justify-center p-0 bg-purple-100 text-purple-800 border-purple-200"
              >
                {botConversations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="flex-1 overflow-y-auto m-0 p-0">
          <ConversationList 
            conversations={activeConversations}
            currentConversation={currentConversation}
            onSelectConversation={selectConversation}
          />
        </TabsContent>
        
        <TabsContent value="waiting" className="flex-1 overflow-y-auto m-0 p-0">
          <ConversationList 
            conversations={waitingConversations}
            currentConversation={currentConversation}
            onSelectConversation={selectConversation}
            onAcceptWaiting={handleAcceptWaiting}
            showAcceptButton={true}
          />
        </TabsContent>
        
        <TabsContent value="bot" className="flex-1 overflow-y-auto m-0 p-0">
          <ConversationList 
            conversations={botConversations}
            currentConversation={currentConversation}
            onSelectConversation={selectConversation}
          />
        </TabsContent>
      </Tabs>
      
      {loading && (
        <div className="p-2 text-center text-gray-500 text-xs bg-gray-50">
          Atualizando conversas...
        </div>
      )}
    </div>
  );
};

interface ConversationListProps {
  conversations: any[];
  currentConversation: any;
  onSelectConversation: (id: string) => void;
  onAcceptWaiting?: (id: string) => void;
  showAcceptButton?: boolean;
}

const ConversationList = ({ 
  conversations, 
  currentConversation, 
  onSelectConversation,
  onAcceptWaiting,
  showAcceptButton
}: ConversationListProps) => {
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Nenhuma conversa disponível
      </div>
    );
  }
  
  return (
    <div className="divide-y">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={cn(
            "p-3 hover:bg-gray-50 cursor-pointer",
            currentConversation?.id === conversation.id ? "bg-gray-100" : ""
          )}
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className={cn(
                conversation.status === 'bot' ? "bg-purple-100 text-purple-800" : 
                conversation.status === 'waiting' ? "bg-yellow-100 text-yellow-800" :
                "bg-blue-100 text-blue-800"
              )}>
                {conversation.status === 'bot' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0" onClick={() => onSelectConversation(conversation.id)}>
              <div className="flex items-center justify-between">
                <p className="font-medium truncate">
                  {`CPF: ${conversation.userCpf}`}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="truncate text-sm text-gray-500">
                  {conversation.departmentName || 'Departamento não definido'}
                  {conversation.serviceName ? ` - ${conversation.serviceName}` : ''}
                </p>
                
                {conversation.status === 'waiting' && showAcceptButton && onAcceptWaiting ? (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs h-7 bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:text-green-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAcceptWaiting(conversation.id);
                    }}
                  >
                    Aceitar
                  </Button>
                ) : (
                  <Badge variant="outline" className={cn(
                    conversation.status === 'waiting' ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                    conversation.status === 'active' ? "bg-green-100 text-green-800 border-green-200" :
                    "bg-purple-100 text-purple-800 border-purple-200"
                  )}>
                    {conversation.status === 'waiting' ? 'Aguardando' : 
                     conversation.status === 'active' ? 'Em atendimento' : 'Bot'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
