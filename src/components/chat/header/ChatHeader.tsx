
import React from 'react';
import { Conversation } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  ChevronLeft, 
  MoreHorizontal,
  PhoneCall,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/chat/ui/Badge';

interface ChatHeaderProps {
  conversation: Conversation;
  closeChat: () => void;
}

const ChatHeader = ({ conversation, closeChat }: ChatHeaderProps) => {
  return (
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
            conversation.status === 'bot' ? "bg-purple-100 text-purple-800" : 
            conversation.status === 'waiting' ? "bg-yellow-100 text-yellow-800" :
            "bg-blue-100 text-blue-800"
          )}>
            {conversation.status === 'bot' ? <Bot className="h-5 w-5" /> : 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <div className="flex items-center">
            <p className="font-medium">
              {conversation.userId || `CPF: ${conversation.userCpf}`}
            </p>
            <Badge className="ml-2" variant="outline">
              {conversation.departmentId || 'Sem departamento'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            {conversation.status === 'active' ? 'Em atendimento' : 
             conversation.status === 'waiting' ? 'Aguardando' :
             conversation.status === 'closed' ? 'Finalizado' : 'Bot'}
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
  );
};

export default ChatHeader;
