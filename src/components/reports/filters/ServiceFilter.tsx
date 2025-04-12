
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Service } from '@/hooks/useReportFilters';

interface ServiceFilterProps {
  service: string;
  setService: (value: string) => void;
  services: Service[];
}

const ServiceFilter: React.FC<ServiceFilterProps> = ({
  service,
  setService,
  services
}) => {
  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium">Serviço:</label>
      <Select value={service} onValueChange={setService}>
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder="Serviço" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="all">Todos</SelectItem>
          {services.map((serv) => (
            <SelectItem key={serv.id} value={serv.id}>
              {serv.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ServiceFilter;
