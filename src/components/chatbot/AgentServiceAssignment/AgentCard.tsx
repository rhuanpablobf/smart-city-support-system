
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentServiceList } from './AgentServiceList';
import { User } from '@/types';

interface AgentCardProps {
  agent: User;
  services: Array<{
    id: string;
    name: string;
    departmentName: string;
  }>;
  selectedServices: string[];
  onToggleService: (agentId: string, serviceId: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ 
  agent,
  services,
  selectedServices,
  onToggleService,
}) => {
  return (
    <Card key={agent.id} className="border">
      <CardHeader className="py-3">
        <CardTitle className="text-lg flex items-center">
          <span>{agent.name}</span>
          <span className="ml-2 text-xs bg-slate-100 px-2 py-1 rounded text-muted-foreground">
            {agent.email}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <AgentServiceList 
          agentId={agent.id}
          services={services}
          selectedServices={selectedServices || []}
          onToggle={onToggleService}
        />
      </CardContent>
    </Card>
  );
};
