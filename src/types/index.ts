
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
  serviceIds?: string[]; // Add the serviceIds property that was missing
}

export interface Department {
  id: string;
  name: string;
  description?: string; // Add description field that was referenced
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
  userCpf?: string;
  departmentName?: string;
  serviceName?: string;
  lastMessageAt?: string;
}

// Add missing types that were referenced in errors
export interface Service {
  id: string;
  name: string;
  department_id: string | null;
}

export interface QAItem {
  id: string;
  question: string;
  answer: string;
  service_id?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  type: 'user' | 'agent' | 'system' | 'bot';
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
