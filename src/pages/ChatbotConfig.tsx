
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DepartmentList } from '@/components/chatbot/DepartmentList';
import { AgentServiceAssignment } from '@/components/chatbot/AgentServiceAssignment';
import { Department } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ChatbotConfig = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados para configurações de mensagens do bot
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Olá! Bem-vindo ao atendimento da Prefeitura. Por favor, informe seu CPF para iniciarmos o atendimento."
  );
  const [transferMessage, setTransferMessage] = useState(
    "Transferindo para um atendente especializado. Por favor, aguarde um momento..."
  );
  
  // Estados para configurações de inatividade
  const [inactivityConfig, setInactivityConfig] = useState({
    firstWarningTime: 1, // minutos até primeiro aviso
    secondWarningTime: 2, // minutos até segundo aviso
    closeTime: 3, // minutos até encerramento
    firstWarningMessage: "Você está online? Estamos aguardando sua resposta.",
    secondWarningMessage: "Ainda está aí? Se não responder, o atendimento será encerrado em breve.",
    closingMessage: "Atendimento encerrado por inatividade. Caso precise, inicie uma nova conversa."
  });

  // Fetch departments
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*');
      
      if (error) throw error;

      return data.map(dept => ({
        id: dept.id,
        name: dept.name,
        description: dept.description || '',
      }));
    }
  });

  // Add department mutation
  const addDepartmentMutation = useMutation({
    mutationFn: async (newDept: Partial<Department>) => {
      const { data, error } = await supabase
        .from('departments')
        .insert({
          name: newDept.name,
          description: newDept.description || null
        })
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: "Secretaria adicionada",
        description: "A nova secretaria foi adicionada com sucesso."
      });
    },
    onError: (error) => {
      console.error("Error adding department:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a secretaria. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Delete department mutation
  const deleteDepartmentMutation = useMutation({
    mutationFn: async (deptId: string) => {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', deptId);

      if (error) throw error;
      return deptId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: "Secretaria removida",
        description: "A secretaria foi removida com sucesso."
      });
    },
    onError: (error) => {
      console.error("Error deleting department:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a secretaria. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const handleAddDepartment = (department: Partial<Department>) => {
    addDepartmentMutation.mutate(department);
  };

  const handleDeleteDepartment = (id: string) => {
    deleteDepartmentMutation.mutate(id);
  };

  // Salvar configurações do bot
  const saveBotConfigMutation = useMutation({
    mutationFn: async (config: any) => {
      // Aqui seria a chamada para salvar as configurações no banco de dados
      // Por enquanto, apenas simulando com um delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return config;
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As configurações do bot foram atualizadas com sucesso."
      });
    },
    onError: (error) => {
      console.error("Error saving bot config:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const handleSaveChanges = () => {
    saveBotConfigMutation.mutate({
      welcomeMessage,
      transferMessage,
      inactivityConfig
    });
  };

  const handleInactivityChange = (field: string, value: any) => {
    setInactivityConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Configuração do Chatbot</h2>
        <Button onClick={handleSaveChanges} disabled={saveBotConfigMutation.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {saveBotConfigMutation.isPending ? "Salvando..." : "Salvar Alterações"}
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
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Autoatendimento</CardTitle>
              <CardDescription>
                Configure o fluxo de mensagens para o atendimento automatizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="welcome-message">Mensagem de Boas-vindas</Label>
                <Input
                  id="welcome-message"
                  placeholder="Olá! Bem-vindo ao atendimento automático da Prefeitura..."
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="transfer-message">Mensagem de Transferência para Atendente</Label>
                <Input
                  id="transfer-message"
                  value={transferMessage}
                  onChange={(e) => setTransferMessage(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Esta mensagem é exibida quando o bot transfere a conversa para um atendente humano.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Editor Visual</CardTitle>
              <CardDescription>
                Arraste e solte elementos para criar o fluxo de conversa do bot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 border rounded-lg bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">O editor visual será implementado aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="mt-4">
          <DepartmentList 
            departments={departments} 
            onAddDepartment={handleAddDepartment}
            onDeleteDepartment={handleDeleteDepartment}
          />
        </TabsContent>
        
        <TabsContent value="inactivity" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tempo de Inatividade e Respostas Automáticas</CardTitle>
              <CardDescription>
                Configure os intervalos e mensagens para usuários inativos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Intervalos de Tempo</h3>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="first-warning-time">Primeiro Aviso (minutos)</Label>
                    <Input
                      id="first-warning-time"
                      type="number"
                      value={inactivityConfig.firstWarningTime}
                      onChange={(e) => handleInactivityChange('firstWarningTime', parseInt(e.target.value, 10))}
                      min={1}
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="second-warning-time">Segundo Aviso (minutos)</Label>
                    <Input
                      id="second-warning-time"
                      type="number"
                      value={inactivityConfig.secondWarningTime}
                      onChange={(e) => handleInactivityChange('secondWarningTime', parseInt(e.target.value, 10))}
                      min={inactivityConfig.firstWarningTime + 1}
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="close-time">Encerrar Conversa (minutos)</Label>
                    <Input
                      id="close-time"
                      type="number"
                      value={inactivityConfig.closeTime}
                      onChange={(e) => handleInactivityChange('closeTime', parseInt(e.target.value, 10))}
                      min={inactivityConfig.secondWarningTime + 1}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Mensagens</h3>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="first-warning-message">Primeiro Aviso</Label>
                    <Input
                      id="first-warning-message"
                      value={inactivityConfig.firstWarningMessage}
                      onChange={(e) => handleInactivityChange('firstWarningMessage', e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="second-warning-message">Segundo Aviso</Label>
                    <Input
                      id="second-warning-message"
                      value={inactivityConfig.secondWarningMessage}
                      onChange={(e) => handleInactivityChange('secondWarningMessage', e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="closing-message">Mensagem de Encerramento</Label>
                    <Input
                      id="closing-message"
                      value={inactivityConfig.closingMessage}
                      onChange={(e) => handleInactivityChange('closingMessage', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="mt-4">
          <AgentServiceAssignment />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatbotConfig;
