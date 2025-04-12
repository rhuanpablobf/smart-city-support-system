
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Department, Service } from '@/types';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserFormContents } from './form/UserFormContents';

const userFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'manager', 'agent'] as const),
  department_id: z.string().optional(),
  serviceIds: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive'] as const)
});

export type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSave: (user: UserFormValues) => void;
  departments: Department[];
  services: Service[];
  currentUserRole?: string;
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({
  open,
  onOpenChange,
  user,
  onSave,
  departments = [],
  services = [],
  currentUserRole = 'admin'
}) => {
  const isEditing = !!user;
  const [selectedRole, setSelectedRole] = useState<string>(user?.role || 'agent');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>(user?.department_id);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'agent',
      department_id: '',
      serviceIds: [],
      status: 'active'
    }
  });

  // Reset form when dialog opens/closes or when user changes
  useEffect(() => {
    if (open && user) {
      // Using setTimeout to prevent React state updates during rendering
      setTimeout(() => {
        form.reset({
          name: user.name,
          email: user.email,
          role: user.role !== 'user' ? user.role : 'agent',
          department_id: user.department_id || '',
          serviceIds: user.serviceIds || [],
          status: user.status || 'active'
        });
        setSelectedRole(user.role);
        setSelectedDepartmentId(user.department_id);
      }, 0);
    } else if (open && !user) {
      // Reset for new user
      setTimeout(() => {
        form.reset({
          name: '',
          email: '',
          role: 'agent',
          department_id: '',
          serviceIds: [],
          status: 'active'
        });
        setSelectedRole('agent');
        setSelectedDepartmentId(undefined);
      }, 0);
    }
  }, [open, user, form]);

  // Update available services when department changes
  useEffect(() => {
    if (selectedDepartmentId) {
      const filteredServices = services.filter(
        service => service.department_id === selectedDepartmentId
      );
      setAvailableServices(filteredServices);
    } else {
      setAvailableServices([]);
    }
  }, [selectedDepartmentId, services]);

  const onSubmit = (values: UserFormValues) => {
    onSave(values);
    // Important: Don't close the dialog here to prevent UI freezing
    // Let the parent component handle closing it after save is complete
  };

  const handleCancelClick = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) {
        // When dialog is closed, reset the form
        form.reset();
      }
      onOpenChange(value);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Usuário' : 'Adicionar Usuário'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edite os detalhes do usuário abaixo.' 
              : 'Preencha os detalhes para criar um novo usuário.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <UserFormContents 
              form={form}
              departments={departments}
              services={services}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              selectedDepartmentId={selectedDepartmentId}
              setSelectedDepartmentId={setSelectedDepartmentId}
              availableServices={availableServices}
              isEditing={isEditing}
              currentUserRole={currentUserRole}
              handleCancelClick={handleCancelClick}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
