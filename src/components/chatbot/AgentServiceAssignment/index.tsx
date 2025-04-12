
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Check, Loader2, HelpCircle } from 'lucide-react';
import { User } from '@/types';
import { AgentCard } from './AgentCard';
import { LoadingState } from './LoadingState';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

export const AgentServiceAssignment = () => {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [selectedAssignments, setSelectedAssignments] = useState<Record<string, string[]>>({});

  // Fetch all agents
  const { data: agents = [], isLoading: loadingAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'agent');

      if (error) throw error;
      
      return data.map((agent: any) => ({
        id: agent.id,
        name: agent.name || 'Agente sem nome',
        email: agent.email,
        role: agent.role,
        department: agent.department_id,
        status: agent.status || 'active',
      }));
    },
  });

  // Fetch all services
  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ['all-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*, departments(name)');

      if (error) throw error;
      
      return data.map((service: any) => ({
        id: service.id,
        name: service.name,
        departmentId: service.department_id,
        departmentName: service.departments?.name || 'Secretaria Desconhecida',
      }));
    },
  });

  // Fetch agent-service assignments
  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['agent-service-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_services')
        .select('agent_id, service_id');
      
      if (error) throw error;
      
      // Convert to Record<string, string[]> format
      const assignmentMap: Record<string, string[]> = {};
      data.forEach((assignment: any) => {
        const agentId = assignment.agent_id;
        const serviceId = assignment.service_id;
        
        if (!assignmentMap[agentId]) {
          assignmentMap[agentId] = [];
        }
        
        assignmentMap[agentId].push(serviceId);
      });
      
      return assignmentMap;
    },
  });

  // Set initial selections when assignments load
  useEffect(() => {
    if (assignments && Object.keys(assignments).length > 0) {
      setSelectedAssignments(assignments as Record<string, string[]>);
    }
  }, [assignments]);

  const toggleServiceForAgent = (agentId: string, serviceId: string) => {
    setSelectedAssignments((prev) => {
      const agentServices = prev[agentId] || [];
      
      if (agentServices.includes(serviceId)) {
        return {
          ...prev,
          [agentId]: agentServices.filter(id => id !== serviceId),
        };
      } else {
        return {
          ...prev,
          [agentId]: [...agentServices, serviceId],
        };
      }
    });
  };

  // Save agent-service assignments mutation
  const saveAssignmentsMutation = useMutation({
    mutationFn: async (assignments: Record<string, string[]>) => {
      // Step 1: Delete all existing agent_services for these agents
      const agentIds = Object.keys(assignments);
      
      for (const agentId of agentIds) {
        await supabase.rpc('delete_agent_services', { agent_id_param: agentId });
      }
      
      // Step 2: Insert new agent_services assignments
      const newAssignments: { agent_id: string; service_id: string; }[] = [];
      
      for (const [agentId, serviceIds] of Object.entries(assignments)) {
        for (const serviceId of serviceIds) {
          newAssignments.push({
            agent_id: agentId,
            service_id: serviceId
          });
        }
      }
      
      if (newAssignments.length > 0) {
        const { error } = await supabase.rpc('insert_agent_services', { 
          services: newAssignments 
        });
        
        if (error) throw error;
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-service-assignments'] });
      toast({
        title: "Atribuições salvas",
        description: "As atribuições de serviços foram atualizadas com sucesso."
      });
    },
    onError: (error) => {
      console.error('Error saving assignments:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as atribuições. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const handleSaveAssignments = async () => {
    setSaving(true);
    try {
      await saveAssignmentsMutation.mutateAsync(selectedAssignments);
    } finally {
      setSaving(false);
    }
  };

  if (loadingAgents || loadingServices || loadingAssignments) {
    return <LoadingState />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atribuição de Serviços aos Atendentes</CardTitle>
        <p className="text-muted-foreground text-sm">
          Selecione quais serviços cada atendente pode atender.
        </p>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <HelpCircle className="h-4 w-4" />
          <AlertTitle>Informação</AlertTitle>
          <AlertDescription>
            Esta tela permite a modificação em lote das atribuições de serviços.
            Você também pode configurar serviços individuais ao criar ou editar um atendente.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {agents.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Nenhum atendente cadastrado no sistema.
            </div>
          ) : (
            agents.map((agent: User) => (
              <AgentCard 
                key={agent.id}
                agent={agent}
                services={services}
                selectedServices={selectedAssignments[agent.id] || []}
                onToggleService={toggleServiceForAgent}
              />
            ))
          )}
          
          <div className="flex justify-end">
            <Button onClick={handleSaveAssignments} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? 'Salvando...' : 'Salvar Atribuições'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

