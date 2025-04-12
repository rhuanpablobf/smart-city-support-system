
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { UseFormReturn } from 'react-hook-form';
import { Service } from '@/types';
import { UserFormValues } from '../UserFormDialog';

interface ServiceCheckboxesProps {
  form: UseFormReturn<UserFormValues>;
  availableServices: Service[];
  selectedRole: string;
  currentUserRole: string;
}

export const ServiceCheckboxes: React.FC<ServiceCheckboxesProps> = ({
  form,
  availableServices,
  selectedRole,
  currentUserRole
}) => {
  // Get service options based on selected role and department
  const getServicesForRole = () => {
    if (currentUserRole === 'manager') {
      // If manager, only show services they're responsible for
      return availableServices;
    }
    
    return availableServices;
  };
  
  const services = getServicesForRole();
  
  if (!services || services.length === 0) {
    return (
      <FormField
        control={form.control}
        name="serviceIds"
        render={() => (
          <FormItem>
            <div className="mb-2">
              <FormLabel>
                {selectedRole === 'manager' 
                  ? 'Serviços que o gerente irá supervisionar' 
                  : 'Serviços que o atendente poderá atender'}
              </FormLabel>
            </div>
            <div className="text-sm text-muted-foreground">
              Nenhum serviço disponível para esta secretaria.
            </div>
          </FormItem>
        )}
      />
    );
  }
  
  return (
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
          
          <div className="space-y-2 border rounded-md p-4">
            {services.map((service) => (
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
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
