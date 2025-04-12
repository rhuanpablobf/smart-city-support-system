
import { Conversation } from '@/types';

export const formatConversation = (conversation: any): Conversation => {
  return {
    id: conversation.id,
    created_at: conversation.created_at,
    updated_at: conversation.updated_at,
    status: conversation.status,
    user_message_count: conversation.user_message_count || 0,
    agent_message_count: conversation.agent_message_count || 0,
    service_id: conversation.service_id,
    department_id: conversation.department_id,
    agent_id: conversation.agent_id,
    user_id: conversation.user_id,
    userCpf: conversation.user_cpf,
    departmentName: conversation.departments?.name,
    serviceName: conversation.services?.name,
    lastMessageAt: conversation.last_message_at
  };
};
