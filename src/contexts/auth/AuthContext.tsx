
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { AuthContextType, ROLE_HIERARCHY } from './types';
import { useAuthService } from './useAuthService';

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authService = useAuthService();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionError, setSessionError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log("AuthProvider - Inicializando e verificando sessão");
    let isMounted = true;

    // First set up the auth state listener before checking for an existing session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthState change event:", event, "session exists:", !!session);

        if (!isMounted) return;
        
        if (event === 'SIGNED_IN' && session?.user) {
          // We'll handle profile fetching separately to avoid deadlocks
          setTimeout(async () => {
            if (!isMounted) return;
            await fetchUserProfile(session.user.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          authService.setCurrentUser(null);
        }
      }
    );

    // Then check for an existing session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setSessionError(error);
          return;
        }
        
        if (session?.user && isMounted) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        if (isMounted) {
          setSessionError(error as Error);
        }
      } finally {
        if (isMounted) {
          setSessionChecked(true);
        }
      }
    };
    
    getSession();
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);
  
  const fetchUserProfile = async (userId: string) => {
    try {
      authService.setLoading(true);
      console.log("Fetching user profile for:", userId);
      
      // Fetch user profile using RPC
      const { data, error } = await supabase
        .rpc('get_all_profiles_safe')
        .then(response => {
          if (response.error) {
            return { data: null, error: response.error };
          }
          const userProfile = response.data.find((profile: any) => profile.id === userId);
          return { data: userProfile || null, error: null };
        });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const serviceIdsResponse = await supabase
          .from('agent_services')
          .select('service_id')
          .eq('agent_id', userId);
          
        const serviceIds = serviceIdsResponse?.data?.map(item => item.service_id) || [];
        
        const user: User = {
          id: data.id,
          name: data.name || 'User',
          email: data.email || '',
          role: data.role as UserRole,
          avatar: data.avatar || '',
          status: (data.status || 'active') as 'active' | 'inactive',
          department: data.departments ? {
            id: data.department_id,
            name: data.department_name
          } : null,
          department_id: data.department_id,
          maxSimultaneousChats: data.max_simultaneous_chats || 5,
          serviceIds
        };
        
        authService.setCurrentUser(user);
        console.log("User profile loaded:", user);
      } else {
        console.log("No user profile found for ID:", userId);
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Erro ao carregar perfil",
        description: error.message || "Não foi possível carregar os dados do usuário",
        variant: "destructive",
      });
    } finally {
      authService.setLoading(false);
    }
  };
  
  const updateUser = async (userData: Partial<User>): Promise<User> => {
    try {
      if (!authService.currentUser) throw new Error("No user is currently logged in");

      // Update the user profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar,
          department_id: userData.department_id,
          max_simultaneous_chats: userData.maxSimultaneousChats,
          status: userData.status
        })
        .eq('id', authService.currentUser.id);

      if (error) throw error;

      // Update local state
      const updatedUser = { ...authService.currentUser, ...userData };
      authService.setCurrentUser(updatedUser);
      
      return updatedUser;
    } catch (error: any) {
      console.error('Update user error:', error.message);
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Não foi possível atualizar os dados do usuário",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const value: AuthContextType = {
    ...authService,
    updateUser,
    loading: authService.loading || !sessionChecked
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
