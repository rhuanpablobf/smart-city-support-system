
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Department, Service } from '@/types';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox } from '@/components/ui/checkbox';

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

  // Track role changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'role') {
        setSelectedRole(value.role || 'agent');
      }
      if (name === 'department_id') {
        setSelectedDepartmentId(value.department_id);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = (values: UserFormValues) => {
    onSave(values);
    // Important: Don't close the dialog here to prevent UI freezing
    // Let the parent component handle closing it after save is complete
  };

  // Determine which departments are available based on current user role
  const getAvailableDepartments = () => {
    // If current user is super admin, all departments are available
    if (currentUserRole === 'admin' && !user?.department_id) {
      return departments;
    }
    
    // If current user is department admin, only their department is available
    return departments;
  };

  // Get service options based on selected role and department
  const getServicesForRole = () => {
    if (!selectedDepartmentId) return [];
    
    if (currentUserRole === 'manager') {
      // If manager, only show services they're responsible for
      return availableServices.filter(service => 
        user?.serviceIds?.includes(service.id)
      );
    }
    
    return availableServices;
  };

  const roleOptions = [
    { value: 'admin', label: 'Administrador' },
    { value: 'manager', label: 'Gerente' },
    { value: 'agent', label: 'Atendente' }
  ];
  
  // Filter role options based on current user role
  const getAvailableRoles = () => {
    if (currentUserRole === 'admin') {
      return roleOptions;
    } else if (currentUserRole === 'manager') {
      return roleOptions.filter(r => r.value === 'agent');
    }
    return roleOptions;
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do usuário" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@exemplo.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedRole(value);
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
            
            {/* Department selection based on role */}
            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secretaria (Departamento)</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedDepartmentId(value);
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
            
            {/* Service selection - only show for managers and agents */}
            {(selectedRole === 'manager' || selectedRole === 'agent') && selectedDepartmentId && (
              <FormField
                control={form.control}
                name="serviceIds"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-2">
                      <FormLabel>
                        {selectedRole === 'manager' 
                          ? 'Serviços que o gerente irá supervisionar' 
                          : 'Serviços que o atendente poderá atender'}
                      </FormLabel>
                    </div>
                    
                    {getServicesForRole().length > 0 ? (
                      <div className="space-y-2 border rounded-md p-4">
                        {getServicesForRole().map((service) => (
                          <div key={service.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`service-${service.id}`}
                              checked={field.value?.includes(service.id)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                const newValue = checked
                                  ? [...currentValue, service.id]
                                  : currentValue.filter(id => id !== service.id);
                                field.onChange(newValue);
                              }}
                            />
                            <label htmlFor={`service-${service.id}`} className="text-sm">
                              {service.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Nenhum serviço disponível para esta secretaria.
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
