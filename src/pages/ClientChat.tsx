
import React from 'react';
import { useDepartmentsAndServices } from '@/hooks/useDepartmentsAndServices';
import { useCpfFormatter } from '@/hooks/useCpfFormatter';
import { useConversationStarter } from '@/hooks/useConversationStarter';
import ChatContainer from '@/components/client-chat/ChatContainer';
import CpfInput from '@/components/client-chat/CpfInput';
import DepartmentSelector from '@/components/client-chat/DepartmentSelector';
import ServiceSelector from '@/components/client-chat/ServiceSelector';
import StartChatButton from '@/components/client-chat/StartChatButton';

const ClientChat = () => {
  // Hooks customizados
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
    loading,
    startConversation
  } = useConversationStarter({
    selectedDepartment,
    selectedService,
    cpf,
    isValidCPF
  });

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
        loading={loading}
        disabled={!selectedDepartment || !selectedService || !cpf}
        onClick={startConversation}
      />
    </ChatContainer>
  );
};

export default ClientChat;
