
import { useState, useEffect } from 'react';
import { User, Department, Service, UserFormValues } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchUsers as fetchUsersService,
  addUser as addUserService,
  updateUser as updateUserService,
  deleteUser as deleteUserService
} from '@/services/user';
import { fetchDepartments as fetchDepartmentsService } from '@/services/departmentService';
import { fetchServices as fetchServicesService, getDepartmentName } from '@/services/serviceService';

// Using 'export type' instead of 'export' to fix the TS1205 error
export type { UserFormValues };

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Effect to fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([loadUsers(), fetchDepartments(), fetchServices()]);
    };
    
    fetchData();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Add new user
  const addUser = async (userData: UserFormValues) => {
    try {
      // Ensure status is always defined
      const userDataWithStatus = {
        ...userData,
        status: userData.status || 'active'
      };
      
      const newUser = await addUserService(userDataWithStatus);
      
      // Update local state
      setUsers(prevUsers => [...prevUsers, newUser]);
      
      toast({
        title: "Usuário adicionado",
        description: "O novo usuário foi adicionado com sucesso.",
      });
      
      return newUser;
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar usuário",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Edit existing user
  const updateUser = async (userId: string, userData: UserFormValues) => {
    try {
      // Ensure status is always defined
      const userDataWithStatus = {
        ...userData,
        status: userData.status || 'active'
      };
      
      await updateUserService(userId, userDataWithStatus);
      
      // Fetch department name for display
      const departmentName = await getDepartmentName(userData.department_id || '');
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                name: userData.name,
                email: userData.email,
                role: userData.role,
                department: departmentName,
                department_id: userData.department_id,
                serviceIds: userData.serviceIds,
                status: userDataWithStatus.status
              } 
            : user
        )
      );
      
      toast({
        title: "Usuário atualizado",
        description: "O usuário foi atualizado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    try {
      await deleteUserService(userId);
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover usuário",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    users,
    departments,
    services,
    filteredUsers,
    searchTerm,
    setSearchTerm,
    addUser,
    updateUser,
    deleteUser,
    loading
  };
}
