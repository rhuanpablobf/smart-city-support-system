
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Department } from '@/types';

export function useDepartmentManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);

  // Fetch departments
  const { data: departments = [], isLoading, error: fetchError, refetch } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching departments:", error);
        throw error;
      }

      console.log("Departments fetched:", data?.length || 0);
      return data.map(dept => ({
        id: dept.id,
        name: dept.name,
        description: dept.description || '',
      })) as Department[];
    }
  });

  // Add department mutation
  const addDepartmentMutation = useMutation({
    mutationFn: async (newDept: Partial<Department>) => {
      setIsAddingDepartment(true);
      
      console.log("Adding department:", newDept);
      
      const { data, error } = await supabase
        .from('departments')
        .insert({
          name: newDept.name,
          description: newDept.description || null
        })
        .select();

      if (error) {
        console.error("Error in insert operation:", error);
        throw error;
      }
      
      console.log("Department added successfully:", data);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: "Secretaria adicionada",
        description: "A nova secretaria foi adicionada com sucesso."
      });
      setIsAddingDepartment(false);
      refetch(); // Manually refetch to ensure latest data
    },
    onError: (error: any) => {
      console.error("Error adding department:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar a secretaria. Tente novamente.",
        variant: "destructive"
      });
      setIsAddingDepartment(false);
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
      refetch(); // Manually refetch to ensure latest data
    },
    onError: (error: any) => {
      console.error("Error deleting department:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível remover a secretaria. Tente novamente.",
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
    isAddingDepartment,
    fetchError,
    handleAddDepartment,
    handleDeleteDepartment,
    refetch
  };
}
