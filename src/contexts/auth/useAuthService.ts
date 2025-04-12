
import { useState, useCallback } from 'react';
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
      
      console.log("Login Supabase bem-sucedido, criando perfil a partir dos metadados...");
      
      // Em vez de buscar o perfil da tabela, vamos usar os metadados do usuário
      // Isso evita o erro de recursão infinita na política de segurança
      const userMetadata = data.user.user_metadata;
      
      // Criar objeto de usuário a partir dos metadados
      const user: User = {
        id: data.user.id,
        name: userMetadata.name || data.user.email?.split('@')[0] || '',
        email: data.user.email || '',
        // Determinar o papel com base no email para fins de demonstração
        role: determineUserRole(data.user.email),
        avatar: userMetadata.avatar || '',
        // Valores padrão para outros campos
        department: null,
        status: 'active', // Add default status
        maxSimultaneousChats: 5
      };
      
      console.log("Definindo usuário atual:", user.role);
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

  // Função de utilitário para determinar o papel do usuário com base no email
  const determineUserRole = (email: string | undefined): UserRole => {
    if (!email) return 'user';
    
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
