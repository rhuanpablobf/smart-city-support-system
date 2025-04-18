
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface ServiceCheckboxProps {
  agentId: string;
  service: {
    id: string;
    name: string;
    departmentName: string;
  };
  isChecked: boolean;
  onToggle: (agentId: string, serviceId: string) => void;
}

export const ServiceCheckbox: React.FC<ServiceCheckboxProps> = ({
  agentId,
  service,
  isChecked,
  onToggle,
}) => {
  const checkboxId = `${agentId}-${service.id}`;
  
  return (
    <div className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded-md">
      <Checkbox 
        id={checkboxId}
        checked={isChecked}
        onCheckedChange={() => onToggle(agentId, service.id)}
      />
      <label 
        htmlFor={checkboxId}
        className="text-sm flex-1 cursor-pointer"
      >
        <span className="font-medium">{service.name}</span>
        <span className="text-xs text-muted-foreground block">
          {service.departmentName}
        </span>
      </label>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0 cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-xs">Os serviços atribuídos aqui determinam quais tipos de atendimento cada agente pode receber</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
