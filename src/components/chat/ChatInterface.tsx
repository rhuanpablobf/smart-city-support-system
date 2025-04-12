
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { ChatMessage } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Paperclip, Send, User, Bot, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ChatInterface = () => {
  const { messages, currentConversation, sendMessage, loading } = useChat();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    sendMessage(messageText);
    setMessageText('');
  };

  if (!currentConversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum chat selecionado</h3>
          <p className="mt-1 text-sm text-gray-500">Selecione uma conversa ou inicie uma nova.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Chat header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {currentConversation.status === 'bot' ? <Bot className="h-6 w-6" /> : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="font-medium">
              {currentConversation.userId || `User (${currentConversation.userCpf})`}
            </p>
            <p className="text-sm text-gray-500">
              CPF: {currentConversation.userCpf}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-right">
            <p className="text-gray-500">
              {currentConversation.status === 'active' ? 'Em atendimento' : 
               currentConversation.status === 'waiting' ? 'Aguardando' :
               currentConversation.status === 'closed' ? 'Finalizado' : 'Bot'}
            </p>
            <p className="text-xs text-gray-400">
              Iniciado {format(new Date(currentConversation.createdAt), 'Pp', { locale: ptBR })}
            </p>
          </div>
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-chatbot-bg">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            disabled={loading}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={loading || currentConversation.status === 'closed'}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={loading || !messageText.trim() || currentConversation.status === 'closed'}
            className="bg-chatbot-primary hover:bg-chatbot-dark"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.senderType === 'user';
  const isBot = message.senderType === 'bot';
  const isAgent = message.senderType === 'agent';
  
  return (
    <div className={cn(
      "flex items-end gap-2 max-w-[80%]",
      isUser ? "ml-auto" : "",
      isBot ? "mr-auto" : "",
      isAgent ? "mr-auto" : ""
    )}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
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

export default ChatInterface;
