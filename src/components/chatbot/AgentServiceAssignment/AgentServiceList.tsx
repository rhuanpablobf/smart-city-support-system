
import React from 'react';
import { ServiceCheckbox } from './ServiceCheckbox';

interface AgentServiceListProps {
  agentId: string;
  services: Array<{
    id: string;
    name: string;
    departmentName: string;
  }>;
  selectedServices: string[];
  onToggle: (agentId: string, serviceId: string) => void;
}

export const AgentServiceList: React.FC<AgentServiceListProps> = ({
  agentId,
  services,
  selectedServices,
  onToggle,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {services.map((service) => (
        <ServiceCheckbox
          key={service.id}
          agentId={agentId}
          service={service}
          isChecked={selectedServices.includes(service.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
};
