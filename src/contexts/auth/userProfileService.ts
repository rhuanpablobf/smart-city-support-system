
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { useToast } from "@/components/ui/use-toast";

/**
 * Service function to fetch a user's profile from Supabase
 */
export const fetchUserProfile = async (
  userId: string, 
  setCurrentUser: (user: User | null) => void,
  setLoading: (loading: boolean) => void,
  toast: ReturnType<typeof useToast>
): Promise<void> => {
  try {
    setLoading(true);
    console.log("Fetching user profile for:", userId);
    
    // Fetch user profile using RPC
    const { data, error } = await supabase
      .rpc('get_all_profiles_safe')
      .then(response => {
        if (response.error) {
          return { data: null, error: response.error };
        }
        const userProfile = response.data?.find((profile: any) => profile.id === userId);
        return { data: userProfile || null, error: null };
      });
    
    if (error) {
      throw error;
    }
    
    if (data) {
      // Determine user role based on email if it's a demo account
      const email = data.email || '';
      let role = data.role as any;
      
      // Override role for demo accounts
      if (email.endsWith('@example.com')) {
        if (email === 'admin@example.com') role = 'admin';
        else if (email === 'manager@example.com') role = 'manager';
        else if (email === 'agent@example.com') role = 'agent';
        else if (email === 'master@example.com') role = 'master';
      }
      
      console.log("Papel determinado:", role);
      
      const serviceIdsResponse = await supabase
        .from('agent_services')
        .select('service_id')
        .eq('agent_id', userId);
        
      const serviceIds = serviceIdsResponse?.data?.map(item => item.service_id) || [];
      
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
      
      setCurrentUser(user);
      console.log("User profile loaded:", user);
    } else {
      console.log("No user profile found for ID:", userId);
    }
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    toast.toast({
      title: "Erro ao carregar perfil",
      description: error.message || "Não foi possível carregar os dados do usuário",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
