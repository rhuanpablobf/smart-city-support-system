
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDepartmentsAndServices } from '@/hooks/useDepartmentsAndServices';
import { useCpfFormatter } from '@/hooks/useCpfFormatter';
import { useConversationStarter } from '@/hooks/useConversationStarter';
import { useConversationStatus } from '@/hooks/useConversationStatus';
import { useWaitingPosition } from '@/hooks/useWaitingPosition';
import ChatContainer from '@/components/client-chat/ChatContainer';
import CpfInput from '@/components/client-chat/CpfInput';
import DepartmentSelector from '@/components/client-chat/DepartmentSelector';
import ServiceSelector from '@/components/client-chat/ServiceSelector';
import StartChatButton from '@/components/client-chat/StartChatButton';
import LoadingState from '@/components/client-chat/LoadingState';
import WaitingState from '@/components/client-chat/WaitingState';
import ActiveChatState from '@/components/client-chat/ActiveChatState';

const ClientChat = () => {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversation');
  const waitingParam = searchParams.get('waiting');
  const isWaiting = waitingParam === 'true';

  // Custom hooks
  const { conversation, loading } = useConversationStatus(conversationId);
  const { waitingPosition } = useWaitingPosition(conversationId, isWaiting || (conversation?.status === 'waiting'));

  const {
    departments,
    services,
    selectedDepartment,
    setSelectedDepartment,
    selectedService,
    setSelectedService
  } = useDepartmentsAndServices();

  const {
    cpf,
    handleCPFChange,
    isValidCPF
  } = useCpfFormatter();

  const {
    loading: startLoading,
    startConversation
  } = useConversationStarter({
    selectedDepartment,
    selectedService,
    cpf,
    isValidCPF
  });

  // Mostrar tela de carregamento
  if (loading) {
    return <LoadingState />;
  }

  // Mostrar tela de espera se estamos em espera
  if (conversation && conversation.status === 'waiting') {
    return (
      <WaitingState 
        waitingPosition={waitingPosition} 
        conversation={conversation} 
      />
    );
  }

  // Mostrar tela de chatbot ativo se estamos em atendimento
  if (conversation && conversation.status === 'active' && conversationId) {
    return <ActiveChatState conversationId={conversationId} />;
  }

  // Formulário inicial para iniciar uma conversa
  return (
    <ChatContainer>
      <CpfInput 
        cpf={cpf}
        onChange={handleCPFChange}
      />
      
      <DepartmentSelector 
        departments={departments}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
      />
      
      <ServiceSelector 
        services={services}
        selectedService={selectedService}
        onServiceChange={setSelectedService}
        selectedDepartment={selectedDepartment}
      />
      
      <StartChatButton 
        loading={startLoading}
        disabled={!selectedDepartment || !selectedService || !cpf}
        onClick={startConversation}
      />
    </ChatContainer>
  );
};

export default ClientChat;
