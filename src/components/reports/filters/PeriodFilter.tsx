
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PeriodFilterProps {
  period: string;
  setPeriod: (value: string) => void;
}

const PeriodFilter: React.FC<PeriodFilterProps> = ({ period, setPeriod }) => {
  return (
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
  );
};

export default PeriodFilter;
