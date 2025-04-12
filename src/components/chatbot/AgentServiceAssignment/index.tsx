
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { User } from '@/types';
import { LoadingState } from './LoadingState';
import { AgentCard } from './AgentCard';

export const AgentServiceAssignment = () => {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

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
  const { data: assignments = {}, isLoading: loadingAssignments } = useQuery({
    queryKey: ['agent-service-assignments'],
    queryFn: async () => {
      // In a real implementation, you would fetch the assignments from the database
      // This is just a placeholder
      return {};
    },
  });

  const [selectedAssignments, setSelectedAssignments] = useState<Record<string, string[]>>(assignments);

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

  const handleSaveAssignments = async () => {
    setSaving(true);
    
    try {
      // In a real implementation, you would save these assignments to the database
      console.log('Saving service assignments:', selectedAssignments);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['agent-service-assignments'] });
    } catch (error) {
      console.error('Error saving assignments:', error);
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
