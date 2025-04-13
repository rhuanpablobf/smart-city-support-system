
import { useState, useCallback } from 'react';
import { User, UserRole } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { ROLE_HIERARCHY } from './types';

export function useAuthService() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log("Iniciando login com Supabase...");
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Erro de login Supabase:", error);
        throw error;
      }
      
      if (!data.user) {
        console.error("Login retornou sem usuário");
        throw new Error("Não foi possível autenticar o usuário");
      }
      
      console.log("Login Supabase bem-sucedido, buscando perfil do usuário...");
      
      // Fetch user profile after authentication using RPC
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_all_profiles_safe')
        .then(response => {
          if (response.error) {
            return { data: null, error: response.error };
          }
          const userProfile = response.data?.find((profile: any) => profile.id === data.user?.id);
          return { data: userProfile || null, error: null };
        });
      
      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError);
        throw profileError;
      }
      
      // Determine user role based on email for demo accounts
      let userRole: UserRole = 'user'; // default role
      
      // Check if it's a demo account by email
      if (data.user.email) {
        if (isDemoAccount(data.user.email)) {
          userRole = determineUserRole(data.user.email);
          console.log("Papel determinado pelo email (demo account):", userRole);
        } else if (profileData?.role) {
          // Use profile role for non-demo accounts
          userRole = profileData.role as UserRole;
          console.log("Papel obtido do perfil:", userRole);
        }
      }
      
      console.log("Papel final determinado:", userRole);
      
      // Create user object from metadata and profile data
      const user: User = {
        id: data.user.id,
        name: profileData?.name || data.user.email?.split('@')[0] || '',
        email: data.user.email || '',
        role: userRole,
        avatar: profileData?.avatar || '',
        department: profileData?.department_id ? {
          id: profileData.department_id,
          name: profileData?.department_name || ''
        } : null,
        department_id: profileData?.department_id || null,
        secretary_id: profileData?.secretary_id || null,
        status: profileData?.status as 'active' | 'inactive' || 'active',
        maxSimultaneousChats: profileData?.max_simultaneous_chats || 5
      };
      
      console.log("Definindo usuário atual:", user);
      
      // Set the default status for master users to offline
      if (userRole === 'master' && user.id) {
        try {
          const { error: statusError } = await supabase
            .from('agent_statuses')
            .upsert({
              id: user.id,
              status: 'offline',
              last_active_at: new Date().toISOString()
            });
            
          if (statusError) {
            console.error("Error setting master status to offline:", statusError);
          }
        } catch (statusError) {
          console.error("Failed to set master status:", statusError);
        }
      }
      
      setCurrentUser(user);
      
      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo de volta, ${user.name}!`,
      });
      
      return user;
    } catch (error: any) {
      console.error("Login falhou com erro:", error);
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

  // Verifica se é uma conta de demonstração
  const isDemoAccount = (email: string | undefined): boolean => {
    if (!email) return false;
    return email.endsWith('@example.com');
  };

  // Função de utilitário para determinar o papel do usuário com base no email
  const determineUserRole = (email: string | undefined): UserRole => {
    if (!email) return 'user';
    
    // Contas de demonstração com email específico
    if (email === 'master@example.com') return 'master';
    if (email === 'admin@example.com') return 'admin';
    if (email === 'manager@example.com') return 'manager';
    if (email === 'agent@example.com') return 'agent';
    
    // Verificação genérica por substring
    if (email.includes('master')) return 'master';
    if (email.includes('admin')) return 'admin';
    if (email.includes('manager')) return 'manager';
    if (email.includes('agent')) return 'agent';
    
    return 'user';
  };

  const logout = useCallback(async () => {
    try {
      console.log("Realizando logout...");
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erro no logout:", error);
        throw error;
      }
      
      setCurrentUser(null);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro no logout:", error);
      toast({
        title: "Erro ao desconectar",
        description: error.message || "Ocorreu um erro ao tentar desconectar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const hasPermission = useCallback((requiredRole: UserRole): boolean => {
    if (!currentUser) {
      console.log("hasPermission: Sem usuário atual");
      return false;
    }
    const userRoleLevel = ROLE_HIERARCHY[currentUser.role] || 0;
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 0;
    
    const hasRole = userRoleLevel >= requiredRoleLevel;
    console.log(`hasPermission: Papel do usuário ${currentUser.role} (${userRoleLevel}), papel necessário ${requiredRole} (${requiredRoleLevel}), resultado: ${hasRole}`);
    return hasRole;
  }, [currentUser]);

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
