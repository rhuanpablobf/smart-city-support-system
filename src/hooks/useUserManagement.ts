
import { useState, useEffect } from 'react';
import { User, Department, Service } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { fetchUsers } from '@/services/user';
import { fetchDepartments } from '@/services/departmentService';
import { fetchServices } from '@/services/serviceService';

// Export type for UserFormValues to avoid TS1205 error
export type { UserFormValues } from '@/types';

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to fetch all users from Supabase
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedUsers = await fetchUsers();
      if (fetchedUsers) {
        setUsers(fetchedUsers);
      }
    } catch (error: any) {
      console.error("Error loading users:", error);
      setError(error.message || 'Failed to load users');
      toast({
        title: "Erro ao carregar usuários",
        description: error.message || 'Não foi possível carregar a lista de usuários',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch departments
  const loadDepartments = async () => {
    try {
      const fetchedDepartments = await fetchDepartments();
      if (fetchedDepartments) {
        setDepartments(fetchedDepartments);
      }
    } catch (error: any) {
      console.error("Error loading departments:", error);
      toast({
        title: "Erro ao carregar departamentos",
        description: error.message || 'Não foi possível carregar os departamentos',
        variant: "destructive",
      });
    }
  };

  // Function to fetch services
  const loadServices = async () => {
    try {
      const fetchedServices = await fetchServices();
      if (fetchedServices) {
        setServices(fetchedServices);
      }
    } catch (error: any) {
      console.error("Error loading services:", error);
      toast({
        title: "Erro ao carregar serviços",
        description: error.message || 'Não foi possível carregar os serviços',
        variant: "destructive",
      });
    }
  };

  // Initial data load
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        await Promise.all([loadUsers(), loadDepartments(), loadServices()]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  return {
    users,
    setUsers,
    departments,
    services,
    loading,
    error,
    refreshUsers: loadUsers
  };
}
