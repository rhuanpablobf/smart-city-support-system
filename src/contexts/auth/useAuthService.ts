
import { useState } from 'react';
import { User, UserRole } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { ROLE_HIERARCHY } from './types';

export function useAuthService() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log("Attempting login with Supabase...");
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Supabase login error:", error);
        throw error;
      }
      
      if (data.user) {
        console.log("Supabase login successful, fetching profile...");
        // Fetch the user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError.message);
          throw new Error("Unable to fetch user profile");
        }
        
        // Create user object from profile data
        const user: User = {
          id: profileData.id,
          name: profileData.name || data.user.email?.split('@')[0] || '',
          email: profileData.email || data.user.email || '',
          role: profileData.role,
          avatar: profileData.avatar || '',
          department: profileData.department_id,
          maxSimultaneousChats: profileData.max_simultaneous_chats
        };
        
        console.log("Setting current user:", user.role);
        setCurrentUser(user);
        
        toast({
          title: "Login bem-sucedido",
          description: `Bem-vindo de volta, ${user.name}!`,
        });
      }
    } catch (error: any) {
      console.error("Login failed with error:", error);
      toast({
        title: "Falha no login",
        description: error.message || "Ocorreu um erro desconhecido",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao desconectar",
        description: error.message || "Ocorreu um erro ao tentar desconectar",
        variant: "destructive",
      });
    }
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!currentUser) return false;
    return ROLE_HIERARCHY[currentUser.role] >= ROLE_HIERARCHY[requiredRole];
  };

  return {
    currentUser,
    setCurrentUser,
    loading,
    setLoading,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!currentUser,
    userRole: currentUser?.role || null,
  };
}
