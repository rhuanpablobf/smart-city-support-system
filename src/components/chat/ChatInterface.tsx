
import React from 'react';
import { useChat } from '@/contexts/chat';
import ChatHeader from './header/ChatHeader';
import ChatInputArea from './input/ChatInputArea';
import MessageList from './message/MessageList';
import EmptyStateMessage from './EmptyStateMessage';

const ChatInterface = () => {
  const { messages, currentConversation, sendMessage, loading, closeChat } = useChat();

  if (!currentConversation) {
    return <EmptyStateMessage />;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ChatHeader conversation={currentConversation} closeChat={closeChat} />
      <MessageList messages={messages} />
      <ChatInputArea 
        conversation={currentConversation} 
        loading={loading} 
        onSendMessage={sendMessage} 
      />
    </div>
  );
};

export default ChatInterface;
