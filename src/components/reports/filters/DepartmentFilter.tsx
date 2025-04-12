
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Department } from '@/hooks/useReportFilters';

interface DepartmentFilterProps {
  department: string;
  setDepartment: (value: string) => void;
  departments: Department[];
}

const DepartmentFilter: React.FC<DepartmentFilterProps> = ({
  department,
  setDepartment,
  departments
}) => {
  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium">Departamento:</label>
      <Select value={department} onValueChange={setDepartment}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Departamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DepartmentFilter;
