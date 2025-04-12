
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DepartmentSelectorProps {
  departments: { id: string; name: string }[];
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
}

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
  departments,
  selectedDepartment,
  onDepartmentChange
}) => {
  return (
    <div className="relative">
      <Label htmlFor="department">Departamento</Label>
      <Select onValueChange={onDepartmentChange} value={selectedDepartment}>
        <SelectTrigger className="mt-1 w-full rounded-md border border-gray-200 px-5 py-3 text-base text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-blue-300">
          <SelectValue placeholder="Selecione um departamento" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {departments.map((department) => (
            <SelectItem key={department.id} value={department.id}>
              {department.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DepartmentSelector;
