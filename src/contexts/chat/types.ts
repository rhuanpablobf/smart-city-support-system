
import { ChatMessage, Conversation } from '@/types';

export interface ConversationsData {
  active: Conversation[];
  waiting: Conversation[];
  bot: Conversation[];
}

export interface ChatContextType {
  conversations: ConversationsData;
  setConversations: (data: ConversationsData) => void;
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  loading: boolean;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  selectConversation: (conversationId: string) => void;
  startNewChat: () => void;
  transferChat: (agentId: string) => void;
  closeChat: () => void;
}
