
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';

/**
 * Service function to fetch a user's profile from Supabase
 */
export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  console.log("Fetching user profile for:", userId);
  
  try {
    // First try direct query to profiles table for better performance
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id, 
        name, 
        email, 
        role, 
        department_id,
        max_simultaneous_chats, 
        status, 
        avatar,
        departments:department_id (name)
      `)
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error in direct profile fetch:', profileError);
      throw profileError;
    }
    
    if (!profileData) {
      console.log("No user profile found for ID:", userId);
      return null;
    }
    
    // Determine user role based on the profile data
    const role = profileData.role as UserRole;
    
    // Fetch agent service IDs if the user is an agent or manager
    let serviceIds: string[] = [];
    if (role === 'agent' || role === 'manager') {
      try {
        const serviceIdsResponse = await supabase
          .from('agent_services')
          .select('service_id')
          .eq('agent_id', userId);
          
        serviceIds = serviceIdsResponse?.data?.map(item => item.service_id) || [];
      } catch (serviceError) {
        console.error('Error fetching service IDs:', serviceError);
        // Continue with empty serviceIds
      }
    }
    
    // Construct user object
    const user: User = {
      id: profileData.id,
      name: profileData.name || 'User',
      email: profileData.email || '',
      role: role,
      avatar: profileData.avatar || '',
      status: (profileData.status || 'active') as 'active' | 'inactive',
      department: profileData.department_id ? {
        id: profileData.department_id,
        name: profileData.departments?.name || ''
      } : null,
      department_id: profileData.department_id,
      maxSimultaneousChats: profileData.max_simultaneous_chats || 5,
      serviceIds
    };
    
    console.log("User profile loaded:", user);
    return user;
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};
