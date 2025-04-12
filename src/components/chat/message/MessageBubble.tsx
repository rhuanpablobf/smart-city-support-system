
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/types';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.type === 'user';
  const isBot = message.type === 'bot';
  const isAgent = message.type === 'agent';
  
  return (
    <div className={cn(
      "flex items-end gap-2 max-w-[80%]",
      isUser ? "ml-auto" : "",
      isBot ? "mr-auto" : "",
      isAgent ? "mr-auto" : ""
    )}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className={isBot ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>
            {isBot ? <Bot className="h-4 w-4" /> : 'A'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "rounded-lg p-3 text-sm",
        isUser ? "bg-chatbot-message-sent text-gray-800" : "",
        isBot ? "bg-chatbot-message-received text-gray-800" : "",
        isAgent ? "bg-chatbot-accent text-white" : ""
      )}>
        <div>{message.content}</div>
        <div className="text-xs mt-1 opacity-70">
          {format(new Date(message.timestamp), 'p', { locale: ptBR })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
