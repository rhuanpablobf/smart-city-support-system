
import { User, UserFormValues } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Add a new user to the system
 */
export const addUser = async (userData: UserFormValues): Promise<User> => {
  try {
    // Create new user ID
    const uuid = uuidv4();
    
    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userData.email)
      .single();
      
    if (existingUser) {
      throw new Error('A user with this email already exists');
    }
    
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is the error code for "not found", which is expected
      console.error('Error checking existing email:', checkError);
      throw checkError;
    }
    
    // Insert profile in profiles table via RPC to avoid recursion issues
    const { error } = await supabase.rpc(
      // Add 'as any' type assertion to fix the TypeScript error
      'insert_profile' as any, 
      {
        profile_id: uuid,
        profile_name: userData.name, 
        profile_email: userData.email,
        profile_role: userData.role,
        profile_department_id: userData.department_id,
        profile_status: userData.status || 'active'
      }
    );

    if (error) {
      console.error('Error adding user:', error.message);
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
      const { error: servicesError } = await supabase.rpc(
        'insert_agent_services' as any, 
        { services: agentServicesData }
      );
        
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
      status: userData.status || 'active' // Ensure we always have a status value
    };
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};
