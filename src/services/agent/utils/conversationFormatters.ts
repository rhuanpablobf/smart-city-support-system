
import { Conversation } from '@/types';

/**
 * Helper to format conversation data
 */
export const formatConversation = (conversation: any): Conversation => ({
  id: conversation.id,
  userId: conversation.user_id || null,
  userCpf: conversation.user_cpf,
  departmentId: conversation.department_id,
  serviceId: conversation.service_id,
  agentId: conversation.agent_id,
  status: conversation.status,
  createdAt: new Date(conversation.created_at),
  updatedAt: new Date(conversation.updated_at || conversation.created_at),
  lastMessageAt: new Date(conversation.last_message_at),
  inactivityWarnings: conversation.inactivity_warnings || 0,
  // Additional fields with departments/services relation data
  departmentName: conversation.departments?.name,
  serviceName: conversation.services?.name
});
