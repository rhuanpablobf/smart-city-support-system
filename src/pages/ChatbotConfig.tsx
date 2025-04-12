
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { DepartmentList } from '@/components/chatbot/DepartmentList';
import { AgentServiceAssignment } from '@/components/chatbot/AgentServiceAssignment';
import { useChatbotConfig } from '@/hooks/useChatbotConfig';
import { useDepartmentManagement } from '@/hooks/useDepartmentManagement';
import FlowsTabContent from '@/components/chatbot/config/FlowsTabContent';
import InactivityTabContent from '@/components/chatbot/config/InactivityTabContent';

const ChatbotConfig = () => {
  const {
    welcomeMessage,
    setWelcomeMessage,
    transferMessage,
    setTransferMessage,
    inactivityConfig,
    handleInactivityChange,
    handleSaveChanges,
    isSaving
  } = useChatbotConfig();
  
  const {
    departments,
    handleAddDepartment,
    handleDeleteDepartment
  } = useDepartmentManagement();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Configuração do Chatbot</h2>
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <Tabs defaultValue="flows">
        <TabsList>
          <TabsTrigger value="flows">Fluxo de Conversação</TabsTrigger>
          <TabsTrigger value="departments">Departamentos</TabsTrigger>
          <TabsTrigger value="inactivity">Configuração de Inatividade</TabsTrigger>
          <TabsTrigger value="agents">Serviços dos Atendentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="flows" className="space-y-4 mt-4">
          <FlowsTabContent
            welcomeMessage={welcomeMessage}
            setWelcomeMessage={setWelcomeMessage}
            transferMessage={transferMessage}
            setTransferMessage={setTransferMessage}
          />
        </TabsContent>

        <TabsContent value="departments" className="mt-4">
          <DepartmentList 
            departments={departments} 
            onAddDepartment={handleAddDepartment}
            onDeleteDepartment={handleDeleteDepartment}
          />
        </TabsContent>
        
        <TabsContent value="inactivity" className="space-y-4 mt-4">
          <InactivityTabContent
            inactivityConfig={inactivityConfig}
            onInactivityChange={handleInactivityChange}
          />
        </TabsContent>

        <TabsContent value="agents" className="mt-4">
          <AgentServiceAssignment />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatbotConfig;
