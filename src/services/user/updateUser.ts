
import { UserFormValues } from '@/types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Update an existing user
 */
export const updateUser = async (userId: string, userData: UserFormValues): Promise<void> => {
  try {
    // Check if email already exists (and is not the current user's)
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userData.email)
      .neq('id', userId)
      .single();
      
    if (existingUser) {
      throw new Error('A user with this email already exists');
    }
    
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is the error code for "not found", which is expected
      console.error('Error checking existing email:', checkError);
    }
    
    // Update profile via RPC to avoid recursion issues
    const { error } = await supabase.rpc(
      // Add 'as any' type assertion to fix the TypeScript error
      'update_profile' as any,
      {
        profile_id: userId,
        profile_name: userData.name, 
        profile_email: userData.email,
        profile_role: userData.role,
        profile_department_id: userData.department_id,
        profile_status: userData.status || 'active'
      }
    );

    if (error) {
      console.error('Error updating user:', error.message);
      throw error;
    }

    // Update user services (delete existing and insert new)
    if (userData.role === 'agent' || userData.role === 'manager') {
      // Remove existing associations using RPC
      const { error: deleteError } = await supabase
        .rpc('delete_agent_services' as any, { agent_id_param: userId });
        
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
          .rpc('insert_agent_services' as any, { 
            services: agentServicesData 
          });
          
        if (insertError) {
          console.error("Error adding agent services:", insertError);
          throw insertError;
        }
      }
    }
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};
