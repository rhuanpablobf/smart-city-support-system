
import { User, UserFormValues } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Fetch users from Supabase with their departments
 */
export const fetchUsers = async (): Promise<User[]> => {
  try {
    // Usando RPC para evitar recursão infinita nas políticas RLS
    const { data, error } = await supabase.rpc(
      'get_all_profiles_safe'
    ) as { data: any[], error: any };

    if (error) {
      console.error('Erro ao buscar perfis:', error.message);
      throw error;
    }

    if (!data) {
      return [];
    }

    // Map to the format User
    const formattedUsers: User[] = data.map((profile: any) => ({
      id: profile.id,
      name: profile.name || '',
      email: profile.email || '',
      role: profile.role,
      department: profile.department_name || null,
      department_id: profile.department_id || null,
      status: profile.status || 'active', // Usar o valor do banco ou 'active' como fallback
      avatar: profile.avatar || undefined,
      maxSimultaneousChats: profile.max_simultaneous_chats || 5
    }));

    // Fetch services for each agent/manager
    for (const user of formattedUsers) {
      if (user.role === 'agent' || user.role === 'manager') {
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
    
    return formattedUsers;
  } catch (error: any) {
    console.error('Erro ao buscar usuários:', error.message);
    throw error;
  }
};

/**
 * Add a new user to the system
 */
export const addUser = async (userData: UserFormValues): Promise<User> => {
  try {
    // Create new user ID
    const uuid = uuidv4();
    
    // Verifique se o email já existe
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userData.email)
      .single();
      
    if (existingUser) {
      throw new Error('Um usuário com este email já existe');
    }
    
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 é o código para "não encontrado", que é esperado
      console.error('Erro ao verificar email existente:', checkError);
      throw checkError;
    }
    
    // Insert profile in profiles table via RPC para evitar problemas de recursão
    const { data, error } = await supabase.rpc('insert_profile', {
      profile_id: uuid,
      profile_name: userData.name, 
      profile_email: userData.email,
      profile_role: userData.role,
      profile_department_id: userData.department_id,
      profile_status: userData.status || 'active'
    });

    if (error) {
      console.error('Erro ao adicionar usuário:', error.message);
      throw error;
    }

    // If manager or agent and has services selected, insert in agent_services table
    if ((userData.role === 'agent' || userData.role === 'manager') && 
        userData.serviceIds && 
        userData.serviceIds.length > 0) {
      
      // Create array of agent_service objects
      const agentServicesData = userData.serviceIds.map(serviceId => ({
        agent_id: uuid,
        service_id: serviceId
      }));
      
      // Use RPC function to insert data
      const { error: servicesError } = await supabase.rpc('insert_agent_services', { 
        services: agentServicesData 
      });
        
      if (servicesError) {
        console.error("Error adding agent services:", servicesError);
        throw servicesError;
      }
    }
    
    // Fetch department name for display
    let departmentName = null;
    if (userData.department_id) {
      const { data: deptData } = await supabase
        .from('departments')
        .select('name')
        .eq('id', userData.department_id)
        .single();
        
      if (deptData) departmentName = deptData.name;
    }

    // Return the new user
    return {
      id: uuid,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      department: departmentName,
      department_id: userData.department_id,
      serviceIds: userData.serviceIds,
      status: userData.status || 'active' // Garantir que sempre temos um valor para status
    };
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    throw error;
  }
};

/**
 * Update an existing user
 */
export const updateUser = async (userId: string, userData: UserFormValues): Promise<void> => {
  try {
    // Verifique se o email já existe (e não é o do usuário atual)
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userData.email)
      .neq('id', userId)
      .single();
      
    if (existingUser) {
      throw new Error('Um usuário com este email já existe');
    }
    
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 é o código para "não encontrado", que é esperado
      console.error('Erro ao verificar email existente:', checkError);
    }
    
    // Update profile via RPC para evitar problemas de recursão
    const { error } = await supabase.rpc('update_profile', {
      profile_id: userId,
      profile_name: userData.name, 
      profile_email: userData.email,
      profile_role: userData.role,
      profile_department_id: userData.department_id,
      profile_status: userData.status || 'active'
    });

    if (error) {
      console.error('Erro ao atualizar usuário:', error.message);
      throw error;
    }

    // Update user services (delete existing and insert new)
    if (userData.role === 'agent' || userData.role === 'manager') {
      // Remove existing associations using RPC
      const { error: deleteError } = await supabase
        .rpc('delete_agent_services', { agent_id_param: userId });
        
      if (deleteError) {
        console.error("Error removing agent services:", deleteError);
        throw deleteError;
      }
      
      // Add new service associations
      if (userData.serviceIds && userData.serviceIds.length > 0) {
        const agentServicesData = userData.serviceIds.map(serviceId => ({
          agent_id: userId,
          service_id: serviceId
        }));
        
        // Use RPC to insert new services
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
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};

/**
 * Delete a user from the system
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Erro ao excluir usuário:', error.message);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    throw error;
  }
};
