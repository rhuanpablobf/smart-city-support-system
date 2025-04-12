
import React from 'react';
import { BasicInfoFields } from './BasicInfoFields';
import { UserRoleField } from './UserRoleField';
import { DepartmentField } from './DepartmentField';
import { ServiceCheckboxes } from './ServiceCheckboxes';
import { StatusField } from './StatusField';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { Department, Service } from '@/types';
import { UserFormValues } from '../UserFormDialog';

interface UserFormContentsProps {
  form: UseFormReturn<UserFormValues>;
  departments: Department[];
  services: Service[];
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  selectedDepartmentId: string | undefined;
  setSelectedDepartmentId: (departmentId: string) => void;
  availableServices: Service[];
  isEditing: boolean;
  currentUserRole: string;
  handleCancelClick: () => void;
}

export const UserFormContents: React.FC<UserFormContentsProps> = ({
  form,
  departments,
  services,
  selectedRole,
  setSelectedRole,
  selectedDepartmentId,
  setSelectedDepartmentId,
  availableServices,
  isEditing,
  currentUserRole,
  handleCancelClick
}) => {
  return (
    <div className="space-y-4">
      <BasicInfoFields form={form} />
      
      <UserRoleField 
        form={form} 
        currentUserRole={currentUserRole} 
        onRoleChange={setSelectedRole} 
      />
      
      <DepartmentField 
        form={form}
        departments={departments}
        currentUserRole={currentUserRole}
        onDepartmentChange={setSelectedDepartmentId}
      />
      
      {/* Service selection - only show for managers and agents */}
      {(selectedRole === 'manager' || selectedRole === 'agent') && selectedDepartmentId && (
        <ServiceCheckboxes 
          form={form}
          availableServices={availableServices}
          selectedRole={selectedRole}
          currentUserRole={currentUserRole}
        />
      )}
      
      <StatusField form={form} />
      
      <DialogFooter className="pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCancelClick}
        >
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Salvar Alterações' : 'Adicionar Usuário'}
        </Button>
      </DialogFooter>
    </div>
  );
};
