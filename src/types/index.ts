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
}

export interface Department {
  id: string;
  name: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

// Add or update ConversationStatus enum to include 'abandoned' and 'completed'
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
}
