
import { Conversation, ChatMessage } from '@/types';

export type ConversationsData = {
  active: Conversation[];
  waiting: Conversation[];
  bot: Conversation[];
};

export type ChatContextType = {
  conversations: ConversationsData;
  setConversations: (data: ConversationsData) => void;
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  loading: boolean;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  startNewChat: () => void;
  transferChat: (agentId: string) => void;
  closeChat: () => Promise<void>;
  refreshConversations: () => Promise<any>;
};
