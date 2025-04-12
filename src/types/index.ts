
export type UserRole = 'admin' | 'manager' | 'agent' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  department_id?: string;
  serviceIds?: string[];
  status: 'active' | 'inactive';
  maxSimultaneousChats?: number;
}

export interface UserFormValues {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'agent';
  department_id?: string;
  serviceIds?: string[];
  status: 'active' | 'inactive';
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'bot' | 'agent' | 'user';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
  read: boolean;
}

export interface Attachment {
  id: string;
  messageId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
}

export interface Service {
  id: string;
  department_id: string;
  name: string;
  description?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  userCpf: string;
  departmentId?: string;
  departmentName?: string;
  serviceId?: string;
  serviceName?: string;
  agentId?: string;
  status: 'bot' | 'waiting' | 'active' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
  inactivityWarnings: number;
  botHistory?: BotInteraction[];
}

export interface BotInteraction {
  step: string;
  question: string;
  answer: string;
  timestamp: Date;
}

export interface AgentStatus {
  id: string;
  status: 'online' | 'offline' | 'break';
  activeChats: number;
  queuePosition?: number;
}

export interface SatisfactionSurvey {
  conversationId: string;
  rating: number;
  comment?: string;
  submittedAt: Date;
}

export interface AgentService {
  id?: string;
  agent_id: string;
  service_id: string;
}

export interface QAItem {
  id: string;
  serviceId: string;
  question: string;
  answer: string;
  hasImage?: boolean;
  imageUrl?: string;
  hasLink?: boolean;
  linkUrl?: string;
  linkText?: string;
}
