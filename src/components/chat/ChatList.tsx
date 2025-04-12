
import React from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquarePlus, Bot, User, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ChatList = () => {
  const { conversations, currentConversation, selectConversation, startNewChat } = useChat();

  // Filter conversations based on status
  const activeConversations = conversations.filter(c => c.status === 'active');
  const waitingConversations = conversations.filter(c => c.status === 'waiting');
  const botConversations = conversations.filter(c => c.status === 'bot');

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      <div className="p-3 flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Buscar conversa..." 
            className="h-9 pl-9" 
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
    </div>
  );
};

interface ConversationListProps {
  conversations: any[];
  currentConversation: any;
  onSelectConversation: (id: string) => void;
}

const ConversationList = ({ conversations, currentConversation, onSelectConversation }: ConversationListProps) => {
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
          onClick={() => onSelectConversation(conversation.id)}
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
            
            <div className="flex-1 min-w-0">
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
                  {conversation.departmentId ? `${conversation.departmentId}` : 'Departamento não definido'}
                  {conversation.serviceId ? ` - ${conversation.serviceId}` : ''}
                </p>
                
                {conversation.status === 'waiting' && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Aguardando
                  </Badge>
                )}
                {conversation.status === 'active' && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Em atendimento
                  </Badge>
                )}
                {conversation.status === 'bot' && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                    Bot
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
