
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ServiceSelectorProps {
  services: { id: string; name: string }[];
  selectedService: string;
  onServiceChange: (value: string) => void;
  selectedDepartment: string;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  selectedService,
  onServiceChange,
  selectedDepartment
}) => {
  return (
    <div className="relative">
      <Label htmlFor="service">Serviço</Label>
      <Select onValueChange={onServiceChange} value={selectedService} disabled={!selectedDepartment || services.length === 0}>
        <SelectTrigger className="mt-1 w-full rounded-md border border-gray-200 px-5 py-3 text-base text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-blue-300">
          <SelectValue placeholder={!selectedDepartment ? "Selecione um departamento primeiro" : "Selecione um serviço"} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {services.map((service) => (
            <SelectItem key={service.id} value={service.id}>
              {service.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedDepartment && services.length === 0 && (
        <p className="text-xs text-red-500 mt-1">
          Nenhum serviço disponível para este departamento.
        </p>
      )}
    </div>
  );
};

export default ServiceSelector;
