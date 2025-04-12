
export type UserRole = 'admin' | 'manager' | 'agent' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: any;
  department_id: string | null;
  status: 'active' | 'inactive';
  maxSimultaneousChats: number;
  serviceIds?: string[];
}

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export type ConversationStatus = 'bot' | 'waiting' | 'active' | 'closed' | 'abandoned' | 'completed';

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  status: ConversationStatus;
  user_message_count: number;
  agent_message_count: number;
  service_id: string | null;
  department_id: string | null;
  agent_id: string | null;
  user_id: string | null;
  userCpf?: string;
  departmentName?: string;
  serviceName?: string;
  lastMessageAt?: string;
}

export interface Service {
  id: string;
  name: string;
  department_id: string | null;
  description?: string; // Add description property
}

export interface QAItem {
  id: string;
  question: string;
  answer: string;
  service_id?: string;
  hasImage?: boolean; // Add missing properties
  imageUrl?: string;
  hasLink?: boolean;
  linkUrl?: string;
  linkText?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  type: 'user' | 'agent' | 'system' | 'bot';
  senderType?: 'user' | 'agent' | 'bot'; // Add senderType property
  read?: boolean;
}

export interface UserFormValues {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  department_id?: string | null;
  status: 'active' | 'inactive';
  maxSimultaneousChats: number;
  serviceIds?: string[];
}

export interface ServiceAttendanceData {
  name: string;
  value: number;
  color: string;
}
