
import { useState, useEffect } from 'react';
import { User, Department, Service } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { fetchUsers as fetchUsersService } from '@/services/user';
import { fetchDepartments as fetchDepartmentsService } from '@/services/departmentService';
import { fetchServices as fetchServicesService } from '@/services/serviceService';

export function useUsersFetch() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch users from Supabase
  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await fetchUsersService();
      setUsers(fetchedUsers);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments from Supabase
  const fetchDepartments = async () => {
    try {
      const fetchedDepartments = await fetchDepartmentsService();
      setDepartments(fetchedDepartments);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar departamentos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Fetch services from Supabase
  const fetchServices = async () => {
    try {
      const fetchedServices = await fetchServicesService();
      setServices(fetchedServices);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar serviços",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Load all data on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        await loadUsers();
        await fetchDepartments();
        await fetchServices();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    
    fetchData();
  }, []);

  return {
    users,
    setUsers,
    departments,
    services,
    loading,
    refreshUsers: loadUsers
  };
}
