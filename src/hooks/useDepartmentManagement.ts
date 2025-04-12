
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Department } from '@/types';

export function useDepartmentManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch departments
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*');
      
      if (error) throw error;

      return data.map(dept => ({
        id: dept.id,
        name: dept.name,
        description: dept.description || '',
      }));
    }
  });

  // Add department mutation
  const addDepartmentMutation = useMutation({
    mutationFn: async (newDept: Partial<Department>) => {
      const { data, error } = await supabase
        .from('departments')
        .insert({
          name: newDept.name,
          description: newDept.description || null
        })
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: "Secretaria adicionada",
        description: "A nova secretaria foi adicionada com sucesso."
      });
    },
    onError: (error) => {
      console.error("Error adding department:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a secretaria. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Delete department mutation
  const deleteDepartmentMutation = useMutation({
    mutationFn: async (deptId: string) => {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', deptId);

      if (error) throw error;
      return deptId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: "Secretaria removida",
        description: "A secretaria foi removida com sucesso."
      });
    },
    onError: (error) => {
      console.error("Error deleting department:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a secretaria. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const handleAddDepartment = (department: Partial<Department>) => {
    addDepartmentMutation.mutate(department);
  };

  const handleDeleteDepartment = (id: string) => {
    deleteDepartmentMutation.mutate(id);
  };

  return {
    departments,
    isLoading,
    handleAddDepartment,
    handleDeleteDepartment
  };
}
