
import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, User } from 'lucide-react';
import { Conversation } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConversationListProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
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

export default ConversationList;
