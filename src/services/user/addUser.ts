
import { supabase } from '@/integrations/supabase/client';
import { UserFormValues, User } from '@/types';

/**
 * Generates a random but secure password
 */
const generateRandomPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  
  // Generate a password with at least 8 characters
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return password;
};

/**
 * Creates a new user in Supabase Auth and adds their profile
 */
export const addUser = async (formData: UserFormValues): Promise<User> => {
  try {
    // Generate a random password for the user - they'll reset it later
    const password = generateRandomPassword();
    
    // Create the user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: formData.email,
      password,
      email_confirm: true, // Skip email verification
      user_metadata: { 
        name: formData.name
      }
    });
    
    if (authError) throw authError;
    
    const userId = authData.user.id;
    
    // Insert the user's profile data
    const { error: profileError } = await supabase.rpc('insert_profile', {
      profile_id: userId,
      profile_name: formData.name,
      profile_email: formData.email,
      profile_role: formData.role,
      profile_department_id: formData.department_id || null,
      profile_status: formData.status
    });
    
    if (profileError) throw profileError;
    
    // Update max_simultaneous_chats separately
    if (formData.maxSimultaneousChats) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          max_simultaneous_chats: formData.maxSimultaneousChats
        })
        .eq('id', userId);
        
      if (updateError) throw updateError;
    }
    
    // If service IDs are provided, associate the agent with these services
    if (formData.serviceIds && formData.serviceIds.length > 0) {
      const serviceData = formData.serviceIds.map(serviceId => ({
        agent_id: userId,
        service_id: serviceId
      }));
      
      await supabase.rpc('insert_agent_services', {
        services: serviceData
      });
    }
    
    // Get the department name for the created user
    const { data: departmentData } = await supabase
      .from('departments')
      .select('name')
      .eq('id', formData.department_id)
      .single();
    
    // Return the created user
    const newUser: User = {
      id: userId,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: departmentData || null,
      department_id: formData.department_id || null,
      serviceIds: formData.serviceIds || [],
      status: formData.status,
      avatar: '', // Default empty avatar
      maxSimultaneousChats: formData.maxSimultaneousChats
    };
    
    return newUser;
  } catch (error: any) {
    console.error('Error adding user:', error);
    throw error;
  }
};
