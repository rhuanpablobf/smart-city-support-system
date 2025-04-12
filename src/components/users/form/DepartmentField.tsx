
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { Department } from '@/types';
import { UserFormValues } from '../UserFormDialog';

interface DepartmentFieldProps {
  form: UseFormReturn<UserFormValues>;
  departments: Department[];
  currentUserRole: string;
  onDepartmentChange: (value: string) => void;
}

export const DepartmentField: React.FC<DepartmentFieldProps> = ({
  form,
  departments,
  currentUserRole,
  onDepartmentChange
}) => {
  // Determine which departments are available based on current user role
  const getAvailableDepartments = () => {
    // If current user is super admin, all departments are available
    if (currentUserRole === 'admin') {
      return departments;
    }
    
    // If current user is department admin, only their department is available
    return departments;
  };
  
  return (
    <FormField
      control={form.control}
      name="department_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Secretaria (Departamento)</FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value);
              onDepartmentChange(value);
              form.setValue('serviceIds', []);
            }}
            value={field.value || ""}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma secretaria" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {getAvailableDepartments().map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
