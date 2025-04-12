
import { useState, useEffect } from 'react';
import { User, UserRole, Department, Service, AgentService } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// Tipo para os valores do formulário de usuário
export interface UserFormValues {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'agent';
  department_id?: string;
  serviceIds?: string[];
  status: 'active' | 'inactive';
}

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Buscar usuários do Supabase
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*, departments:department_id(id, name, description)');

      if (error) throw error;

      // Mapear para o formato User
      const formattedUsers: User[] = profiles.map((profile: any) => ({
        id: profile.id,
        name: profile.name || '',
        email: profile.email || '',
        role: profile.role as UserRole,
        department: profile.departments?.name || null,
        department_id: profile.department_id || null,
        status: 'active', // Default status, poderia ser armazenado no Supabase também
        avatar: profile.avatar || undefined,
        maxSimultaneousChats: profile.max_simultaneous_chats || 5
      }));

      setUsers(formattedUsers);

      // Buscar serviços associados a cada agente/gerente
      for (const user of formattedUsers) {
        if (user.role === 'agent' || user.role === 'manager') {
          // Use the raw SQL query instead of the client since the table might not be in the types yet
          const { data: agentServices, error: servicesError } = await supabase
            .from('agent_services')
            .select('service_id')
            .eq('agent_id', user.id);
          
          if (servicesError) {
            console.error('Error fetching agent services:', servicesError);
            continue;
          }
          
          if (agentServices && agentServices.length > 0) {
            user.serviceIds = agentServices.map(as => as.service_id);
          }
        }
      }
      
      setUsers(formattedUsers);
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

  // Buscar departamentos do Supabase
  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*');

      if (error) throw error;
      
      setDepartments(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar departamentos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Buscar serviços do Supabase
  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*');

      if (error) throw error;
      
      setServices(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar serviços",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Efeito para buscar dados do Supabase
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchUsers(), fetchDepartments(), fetchServices()]);
    };
    
    fetchData();
  }, []);

  // Filtrar usuários com base no termo de pesquisa
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Adicionar novo usuário
  const addUser = async (userData: UserFormValues) => {
    try {
      // Criar novo usuário no Supabase Auth (simulado - em produção usaria Supabase Auth)
      // Nota: Em produção, isso seria feito através de uma função de borda ou backend
      const uuid = uuidv4();
      
      // Inserir perfil na tabela profiles
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: uuid,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          department_id: userData.department_id,
          max_simultaneous_chats: 5, // Valor padrão
          status: userData.status === 'active' ? 'active' : 'inactive'
        })
        .select()
        .single();

      if (error) throw error;

      // Se for gerente ou atendente e tiver serviços selecionados, inserir na tabela agent_services
      if ((userData.role === 'agent' || userData.role === 'manager') && 
          userData.serviceIds && 
          userData.serviceIds.length > 0) {
        
        // Create an array of agent_service objects
        const agentServicesData = userData.serviceIds.map(serviceId => ({
          agent_id: uuid,
          service_id: serviceId
        }));
        
        // Use a raw SQL query to insert data
        const { error: servicesError } = await supabase
          .rpc('insert_agent_services', { 
            services: agentServicesData 
          });
          
        if (servicesError) {
          console.error("Error adding agent services:", servicesError);
          toast({
            title: "Aviso",
            description: "Usuário criado, mas houve um erro ao associar serviços.",
            variant: "warning",
          });
        }
      }
      
      // Buscar nome do departamento para exibição
      let departmentName = null;
      if (userData.department_id) {
        const { data: deptData } = await supabase
          .from('departments')
          .select('name')
          .eq('id', userData.department_id)
          .single();
          
        if (deptData) departmentName = deptData.name;
      }

      const newUser: User = {
        id: uuid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: departmentName,
        department_id: userData.department_id,
        serviceIds: userData.serviceIds,
        status: userData.status
      };
      
      // Atualizar estado local
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

  // Editar usuário existente
  const updateUser = async (userId: string, userData: UserFormValues) => {
    try {
      // Atualizar perfil na tabela profiles
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          department_id: userData.department_id,
          status: userData.status === 'active' ? 'active' : 'inactive'
        })
        .eq('id', userId);

      if (error) throw error;

      // Atualizar serviços do usuário (excluir existentes e inserir novos)
      if (userData.role === 'agent' || userData.role === 'manager') {
        // Remover associações existentes usando raw SQL
        const { error: deleteError } = await supabase
          .rpc('delete_agent_services', { agent_id_param: userId });
          
        if (deleteError) {
          console.error("Error removing agent services:", deleteError);
          throw deleteError;
        }
        
        // Adicionar novas associações de serviços
        if (userData.serviceIds && userData.serviceIds.length > 0) {
          const agentServicesData = userData.serviceIds.map(serviceId => ({
            agent_id: userId,
            service_id: serviceId
          }));
          
          // Use raw SQL to insert the new services
          const { error: insertError } = await supabase
            .rpc('insert_agent_services', { 
              services: agentServicesData 
            });
            
          if (insertError) {
            console.error("Error adding agent services:", insertError);
            throw insertError;
          }
        }
      }

      // Buscar nome do departamento para exibição
      let departmentName = null;
      if (userData.department_id) {
        const { data: deptData } = await supabase
          .from('departments')
          .select('name')
          .eq('id', userData.department_id)
          .single();
          
        if (deptData) departmentName = deptData.name;
      }
      
      // Atualizar estado local
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
                status: userData.status
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
    }
  };

  // Excluir usuário
  const deleteUser = async (userId: string) => {
    try {
      // Em produção, isso seria feito através de uma função de borda ou backend
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      // Atualizar estado local
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
