
import React from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquarePlus, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ChatList = () => {
  const { conversations, currentConversation, selectConversation, startNewChat } = useChat();

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-lg">Conversas</h2>
        <Button 
          onClick={startNewChat}
          variant="outline" 
          size="icon"
          className="h-8 w-8"
        >
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Nenhuma conversa disponível
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => selectConversation(conversation.id)}
                className={cn(
                  "p-4 hover:bg-gray-50 cursor-pointer",
                  currentConversation?.id === conversation.id ? "bg-gray-100" : ""
                )}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {conversation.status === 'bot' ? <Bot className="h-6 w-6" /> : <User className="h-6 w-6" />}
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
                    
                    <p className="truncate text-sm text-gray-500">
                      {conversation.status === 'active' ? 'Em atendimento' : 
                       conversation.status === 'waiting' ? 'Aguardando' :
                       conversation.status === 'closed' ? 'Finalizado' : 'Com o bot'}
                    </p>
                  </div>
                  
                  {conversation.status === 'waiting' && (
                    <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
                  )}
                  {conversation.status === 'active' && (
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
