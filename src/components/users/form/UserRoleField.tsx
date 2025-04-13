
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { UserFormValues } from '../UserFormDialog';

interface UserRoleFieldProps {
  form: UseFormReturn<UserFormValues>;
  currentUserRole: string;
  onRoleChange: (value: string) => void;
}

export const UserRoleField: React.FC<UserRoleFieldProps> = ({ 
  form, 
  currentUserRole,
  onRoleChange
}) => {
  const roleOptions = [
    { value: 'master', label: 'Master Administrador' },
    { value: 'admin', label: 'Administrador de Secretaria' },
    { value: 'manager', label: 'Gerente' },
    { value: 'agent', label: 'Atendente' }
  ];
  
  // Filter role options based on current user role
  const getAvailableRoles = () => {
    if (currentUserRole === 'master') {
      return roleOptions;
    } else if (currentUserRole === 'admin') {
      return roleOptions.filter(r => r.value !== 'master');
    } else if (currentUserRole === 'manager') {
      return roleOptions.filter(r => r.value === 'agent');
    }
    return [];
  };
  
  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Função</FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value);
              onRoleChange(value);
            }}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma função" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {getAvailableRoles().map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
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
