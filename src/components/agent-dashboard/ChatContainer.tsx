
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ChatList from '@/components/chat/ChatList';
import ChatInterface from '@/components/chat/ChatInterface';
import { Conversation } from '@/types';

interface ChatContainerProps {
  activeChats: number;
  waitingChats: number;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  activeChats, 
  waitingChats 
}) => {
  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
      <Card className="overflow-hidden">
        <CardHeader className="py-3">
          <CardTitle className="text-base font-medium flex items-center justify-between">
            <span>Conversas</span>
            <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
              {activeChats + waitingChats}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          <div className="h-[500px]">
            <ChatList />
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2 overflow-hidden">
        <CardHeader className="py-3">
          <CardTitle className="text-base font-medium">Conversa Atual</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          <div className="h-[500px]">
            <ChatInterface />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatContainer;
