
import { User, UserFormValues } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Fetch users from Supabase with their departments
 */
export const fetchUsers = async (): Promise<User[]> => {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*, departments:department_id(id, name, description)');

  if (error) throw error;

  // Map to the format User
  const formattedUsers: User[] = profiles.map((profile: any) => ({
    id: profile.id,
    name: profile.name || '',
    email: profile.email || '',
    role: profile.role,
    department: profile.departments?.name || null,
    department_id: profile.department_id || null,
    status: 'active', // Default status
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
};

/**
 * Add a new user to the system
 */
export const addUser = async (userData: UserFormValues): Promise<User> => {
  // Create new user ID
  const uuid = uuidv4();
  
  // Insert profile in profiles table
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: uuid,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      department_id: userData.department_id,
      max_simultaneous_chats: 5, // Default value
      status: userData.status === 'active' ? 'active' : 'inactive'
    })
    .select()
    .single();

  if (error) throw error;

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
    status: userData.status
  };
};

/**
 * Update an existing user
 */
export const updateUser = async (userId: string, userData: UserFormValues): Promise<void> => {
  // Update profile in profiles table
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
};

/**
 * Delete a user from the system
 */
export const deleteUser = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) throw error;
};
