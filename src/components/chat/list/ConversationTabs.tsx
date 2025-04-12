
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ConversationList from './ConversationList';
import { MessageCircle, Clock, Bot as BotIcon } from 'lucide-react';
import { Conversation } from '@/types';

interface ConversationTabsProps {
  activeConversations: Conversation[];
  waitingConversations: Conversation[];
  botConversations: Conversation[];
  currentConversation: Conversation | null;
  onSelectConversation: (id: string) => void;
  onAcceptWaiting: (id: string) => void;
  isLoading: boolean;
}

const ConversationTabs = ({ 
  activeConversations, 
  waitingConversations, 
  botConversations,
  currentConversation,
  onSelectConversation,
  onAcceptWaiting,
  isLoading
}: ConversationTabsProps) => {
  return (
    <Tabs defaultValue="active" className="flex-1 flex flex-col overflow-hidden">
      <TabsList className="grid grid-cols-3 mx-3">
        <TabsTrigger value="active" className="relative flex items-center gap-1">
          <MessageCircle className="h-4 w-4" />
          <span>Ativos</span>
          {activeConversations.length > 0 && (
            <Badge 
              variant="outline" 
              className="ml-1 h-5 min-w-5 flex items-center justify-center p-0 bg-blue-100 text-blue-800 border-blue-200"
            >
              {activeConversations.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="waiting" className="relative flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>Espera</span>
          {waitingConversations.length > 0 && (
            <Badge 
              variant="outline" 
              className="ml-1 h-5 min-w-5 flex items-center justify-center p-0 bg-yellow-100 text-yellow-800 border-yellow-200"
            >
              {waitingConversations.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="bot" className="relative flex items-center gap-1">
          <BotIcon className="h-4 w-4" />
          <span>Bot</span>
          {botConversations.length > 0 && (
            <Badge 
              variant="outline" 
              className="ml-1 h-5 min-w-5 flex items-center justify-center p-0 bg-purple-100 text-purple-800 border-purple-200"
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
          onSelectConversation={onSelectConversation}
          isLoading={isLoading}
          emptyMessage="Nenhuma conversa ativa no momento"
        />
      </TabsContent>
      
      <TabsContent value="waiting" className="flex-1 overflow-y-auto m-0 p-0">
        <ConversationList 
          conversations={waitingConversations}
          currentConversation={currentConversation}
          onSelectConversation={onSelectConversation}
          onAcceptWaiting={onAcceptWaiting}
          showAcceptButton={true}
          isLoading={isLoading}
          emptyMessage="Nenhuma conversa em espera"
        />
      </TabsContent>
      
      <TabsContent value="bot" className="flex-1 overflow-y-auto m-0 p-0">
        <ConversationList 
          conversations={botConversations}
          currentConversation={currentConversation}
          onSelectConversation={onSelectConversation}
          isLoading={isLoading}
          emptyMessage="Nenhuma conversa com o bot"
        />
      </TabsContent>
    </Tabs>
  );
};

export default ConversationTabs;
