
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetch users from Supabase with their departments
 */
export const fetchUsers = async (): Promise<User[]> => {
  try {
    // Using RPC to avoid infinite recursion in RLS policies
    const { data, error } = await supabase.rpc(
      'get_all_profiles_safe' as any
    ) as { data: any[], error: any };

    if (error) {
      console.error('Error fetching profiles:', error.message);
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
      status: profile.status || 'active', // Use value from database or 'active' as fallback
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
    console.error('Error fetching users:', error.message);
    throw error;
  }
};
