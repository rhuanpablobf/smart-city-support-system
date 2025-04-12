
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DepartmentList } from '@/components/chatbot/DepartmentList';
import { AgentServiceAssignment } from '@/components/chatbot/AgentServiceAssignment';
import { Department } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ChatbotConfig = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Olá! Bem-vindo ao atendimento da Prefeitura. Por favor, informe seu CPF para iniciarmos o atendimento."
  );
  const [timeoutMessage, setTimeoutMessage] = useState(
    "Você está online? Estamos aguardando sua resposta."
  );
  const [secondTimeoutMessage, setSecondTimeoutMessage] = useState(
    "Ainda está aí? Se não responder, o atendimento será encerrado em breve."
  );
  const [closingMessage, setClosingMessage] = useState(
    "Atendimento encerrado por inatividade. Caso precise, inicie uma nova conversa."
  );
  const [maxInactivity, setMaxInactivity] = useState(3);
  const [transferMessage, setTransferMessage] = useState(
    "Transferindo para um atendente especializado. Por favor, aguarde um momento..."
  );

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
    onSuccess: (deptId) => {
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

  const handleSaveChanges = () => {
    // Save all configuration values
    // This would typically be an API call to save the configuration
    toast({
      title: "Configurações salvas",
      description: "As alterações foram salvas com sucesso."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Configuração do Chatbot</h2>
        <Button onClick={handleSaveChanges}>
          <Save className="mr-2 h-4 w-4" />
          Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="flows">
        <TabsList>
          <TabsTrigger value="flows">Fluxos de Conversação</TabsTrigger>
          <TabsTrigger value="responses">Respostas Automáticas</TabsTrigger>
          <TabsTrigger value="settings">Configurações Gerais</TabsTrigger>
          <TabsTrigger value="agents">Atribuição de Serviços</TabsTrigger>
        </TabsList>
        
        <TabsContent value="flows" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Autoatendimento</CardTitle>
              <CardDescription>
                Configure o fluxo de mensagens e opções para o atendimento automatizado
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
              
              <DepartmentList 
                departments={departments} 
                onAddDepartment={handleAddDepartment}
                onDeleteDepartment={handleDeleteDepartment}
              />
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
        
        <TabsContent value="responses" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Respostas Padrão</CardTitle>
              <CardDescription>
                Configure mensagens automáticas para situações específicas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="timeout-message">Mensagem de Inatividade (1 min)</Label>
                <Input
                  id="timeout-message"
                  placeholder="Você está online?"
                  value={timeoutMessage}
                  onChange={(e) => setTimeoutMessage(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="second-timeout">Segunda Mensagem de Inatividade (2 min)</Label>
                <Input
                  id="second-timeout"
                  placeholder="Ainda está aí?"
                  value={secondTimeoutMessage}
                  onChange={(e) => setSecondTimeoutMessage(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="closing-message">Mensagem de Encerramento</Label>
                <Input
                  id="closing-message"
                  placeholder="Atendimento encerrado"
                  value={closingMessage}
                  onChange={(e) => setClosingMessage(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Ajuste parâmetros do comportamento do bot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="max-inactivity">Tempo máximo de inatividade (minutos)</Label>
                <Input
                  id="max-inactivity"
                  type="number"
                  value={maxInactivity}
                  onChange={(e) => setMaxInactivity(parseInt(e.target.value, 10))}
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="transfer-message">Mensagem de Transferência para Atendente</Label>
                <Input
                  id="transfer-message"
                  value={transferMessage}
                  onChange={(e) => setTransferMessage(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4 mt-4">
          <AgentServiceAssignment />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatbotConfig;
