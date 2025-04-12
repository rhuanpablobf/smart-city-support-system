
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReportFiltersProps {
  period: string;
  setPeriod: (value: string) => void;
  department: string;
  setDepartment: (value: string) => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  period,
  setPeriod,
  department,
  setDepartment
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium">Período:</label>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Últimos 7 dias</SelectItem>
            <SelectItem value="month">Últimos 30 dias</SelectItem>
            <SelectItem value="quarter">Últimos 3 meses</SelectItem>
            <SelectItem value="year">Último ano</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium">Departamento:</label>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="health">Saúde</SelectItem>
            <SelectItem value="education">Educação</SelectItem>
            <SelectItem value="finance">Finanças</SelectItem>
            <SelectItem value="infrastructure">Infraestrutura</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ReportFilters;
