
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/chat';
import { ChatMessage } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Paperclip, 
  Send, 
  User, 
  Bot, 
  Loader2, 
  MoreHorizontal, 
  PhoneCall,
  Smile,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ChatInterface = () => {
  const { messages, currentConversation, sendMessage, loading, closeChat } = useChat();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // In a real app, you would upload the file and send it
      sendMessage(`Arquivo enviado: ${files[0].name}`);
    }
  };

  if (!currentConversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-xs">
          <MessageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhuma conversa selecionada</h3>
          <p className="mt-1 text-sm text-gray-500">Selecione uma conversa na lista ao lado ou inicie um novo atendimento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Chat header */}
      <div className="bg-white border-b p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2 h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-9 w-9">
            <AvatarFallback className={cn(
              currentConversation.status === 'bot' ? "bg-purple-100 text-purple-800" : 
              currentConversation.status === 'waiting' ? "bg-yellow-100 text-yellow-800" :
              "bg-blue-100 text-blue-800"
            )}>
              {currentConversation.status === 'bot' ? <Bot className="h-5 w-5" /> : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <div className="flex items-center">
              <p className="font-medium">
                {currentConversation.userId || `CPF: ${currentConversation.userCpf}`}
              </p>
              <Badge className="ml-2" variant="outline">
                {currentConversation.departmentId || 'Sem departamento'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              {currentConversation.status === 'active' ? 'Em atendimento' : 
               currentConversation.status === 'waiting' ? 'Aguardando' :
               currentConversation.status === 'closed' ? 'Finalizado' : 'Bot'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <PhoneCall className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Opções</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <AlertCircle className="mr-2 h-4 w-4" />
                <span>Transferir atendimento</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={closeChat}>
                <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                <span className="text-red-500">Encerrar atendimento</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      <div className="bg-white border-t p-3">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            disabled={loading || currentConversation.status === 'closed'}
            onClick={handleFileUpload}
            className="h-9 w-9"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            disabled={loading || currentConversation.status === 'closed'}
            className="h-9 w-9"
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={loading || currentConversation.status === 'closed'}
            className="flex-1 h-9"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={loading || !messageText.trim() || currentConversation.status === 'closed'}
            className="bg-chatbot-primary hover:bg-chatbot-dark h-9 w-9"
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

// Special icon component for the empty state
const MessageIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
      <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
    </svg>
  );
};

// Add the Badge component since it's used in this file
const Badge = ({ variant = "default", className, ...props }: any) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === "default" && "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        variant === "outline" && "border-border bg-background text-foreground",
        className
      )}
      {...props}
    />
  );
};

export default ChatInterface;
