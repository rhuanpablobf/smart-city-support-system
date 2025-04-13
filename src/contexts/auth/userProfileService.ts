
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';

/**
 * Service function to fetch a user's profile from Supabase
 */
export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  console.log("Fetching user profile for:", userId);
  
  try {
    // Fetch user profile using RPC
    const { data, error } = await supabase
      .rpc('get_all_profiles_safe')
      .then(response => {
        if (response.error) {
          return { data: null, error: response.error };
        }
        
        // Handle null response data
        if (!response.data) {
          return { data: null, error: new Error('No profiles data returned') };
        }
        
        const userProfile = response.data?.find((profile: any) => profile.id === userId);
        return { data: userProfile || null, error: null };
      });
    
    if (error) {
      console.error('Error in get_all_profiles_safe RPC:', error);
      throw error;
    }
    
    if (!data) {
      console.log("No user profile found for ID:", userId);
      
      // Fallback: Try direct query to profiles table
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
          avatar
        `)
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Error in fallback profile fetch:', profileError);
        throw profileError;
      }
      
      if (!profileData) {
        return null;
      }
      
      // Use the fallback data
      return {
        id: profileData.id,
        name: profileData.name || 'User',
        email: profileData.email || '',
        role: profileData.role as UserRole,
        avatar: profileData.avatar || '',
        status: (profileData.status || 'active') as 'active' | 'inactive',
        department_id: profileData.department_id,
        department: profileData.department_id ? {
          id: profileData.department_id,
          name: '' // We don't have the department name in this fallback
        } : null,
        maxSimultaneousChats: profileData.max_simultaneous_chats || 5,
        serviceIds: [] // We don't have service IDs in the fallback
      };
    }
    
    // Determine user role based on email if it's a demo account
    const email = data.email || '';
    let role: UserRole = data.role as UserRole;
    
    // Special handling for demo accounts
    if (email.endsWith('@example.com')) {
      if (email === 'admin@example.com') role = 'admin';
      else if (email === 'manager@example.com') role = 'manager';
      else if (email === 'agent@example.com') role = 'agent';
      else if (email === 'master@example.com') role = 'master';
    }
    
    console.log("Papel determinado:", role);
    
    // Fetch agent service IDs
    let serviceIds: string[] = [];
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
    
    // Construct user object
    const user: User = {
      id: data.id,
      name: data.name || 'User',
      email: data.email || '',
      role: role,
      avatar: data.avatar || '',
      status: (data.status || 'active') as 'active' | 'inactive',
      department: data.department_id ? {
        id: data.department_id,
        name: data.department_name || ''
      } : null,
      department_id: data.department_id,
      maxSimultaneousChats: data.max_simultaneous_chats || 5,
      serviceIds
    };
    
    console.log("User profile loaded:", user);
    return user;
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};
