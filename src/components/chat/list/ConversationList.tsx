
import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Loader } from 'lucide-react';
import { Conversation } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface ConversationListProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onSelectConversation: (id: string) => void;
  onAcceptWaiting?: (id: string) => void;
  showAcceptButton?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
}

const ConversationList = ({ 
  conversations, 
  currentConversation, 
  onSelectConversation,
  onAcceptWaiting,
  showAcceptButton,
  isLoading = false,
  emptyMessage = "Nenhuma conversa disponível"
}: ConversationListProps) => {
  if (isLoading) {
    return (
      <div className="divide-y">
        {[...Array(3)].map((_, index) => (
          <div key={`skeleton-${index}`} className="p-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="divide-y">
      {conversations.map((conversation) => {
        const isActive = currentConversation?.id === conversation.id;
        const timeAgo = formatDistanceToNow(new Date(conversation.lastMessageAt), { 
          addSuffix: true,
          locale: ptBR
        });
        
        return (
          <div 
            key={conversation.id}
            className={cn(
              "p-3 hover:bg-gray-50 cursor-pointer",
              isActive && "bg-blue-50 hover:bg-blue-50"
            )}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="flex items-start">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarFallback className={cn(
                  "bg-gray-200 text-gray-700",
                  conversation.status === 'bot' && "bg-purple-100 text-purple-700"
                )}>
                  {conversation.status === 'bot' ? <Bot size={16} /> : <User size={16} />}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium truncate">
                    {conversation.userCpf}
                  </p>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {timeAgo}
                  </span>
                </div>
                
                <div className="flex items-center">
                  {conversation.departmentName && (
                    <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 mr-1">
                      {conversation.departmentName}
                    </span>
                  )}
                  
                  {conversation.serviceName && (
                    <span className="text-xs truncate text-gray-500">
                      {conversation.serviceName}
                    </span>
                  )}
                </div>
              </div>
              
              {showAcceptButton && conversation.status === 'waiting' && onAcceptWaiting && (
                <Button
                  size="sm"
                  className="ml-2 h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAcceptWaiting(conversation.id);
                  }}
                >
                  Aceitar
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
