
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, AuthProviderProps } from './types';
import { useAuthService } from './useAuthService';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    currentUser,
    setCurrentUser,
    loading,
    setLoading,
    login,
    logout,
    hasPermission,
    isAuthenticated,
    userRole
  } = useAuthService();

  // Check if user is already logged in with Supabase
  useEffect(() => {
    console.log("AuthProvider inicializado, verificando autenticação");
    let isMounted = true;
    let authTimeout: NodeJS.Timeout;

    // Set a global timeout to prevent being stuck in loading state
    authTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.error("Verificação de autenticação expirou após 5 segundos");
        setLoading(false);
      }
    }, 5000); // Reduzido para 5 segundos

    const checkCurrentUser = async () => {
      try {
        console.log("Verificando sessão atual...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro ao verificar sessão:", error.message);
          if (isMounted) setLoading(false);
          return;
        }
        
        if (!data.session) {
          console.log("Nenhuma sessão encontrada, usuário não está autenticado");
          if (isMounted) setLoading(false);
          return;
        }
        
        console.log("Sessão encontrada, usuário está autenticado");
        
        // Obter o usuário da sessão
        const userData = data.session.user;
        
        try {
          // Buscar perfil do usuário após autenticação usando RPC
          const { data: profileData, error: profileError } = await supabase
            .rpc('get_all_profiles_safe')
            .then(response => {
              if (response.error) {
                return { data: null, error: response.error };
              }
              const userProfile = response.data.find((profile: any) => profile.id === userData.id);
              return { data: userProfile || null, error: null };
            });
          
          if (profileError) {
            console.error("Erro ao buscar perfil:", profileError);
          }
          
          // Determinar o papel do usuário corretamente
          let userRole: UserRole = 'user'; // default role
          
          // Se temos dados do perfil, usar o papel do perfil
          if (profileData && profileData.role) {
            userRole = profileData.role as UserRole;
            console.log("Papel obtido do perfil:", userRole);
          } else {
            // Alternativa baseada no email (fallback)
            if (userData.email) {
              if (userData.email.includes('admin')) userRole = 'admin';
              else if (userData.email.includes('manager')) userRole = 'manager';
              else if (userData.email.includes('agent')) userRole = 'agent';
            }
            console.log("Papel determinado pelo email:", userRole);
          }
          
          // Criar o objeto de usuário usando os metadados e dados do perfil
          const user = {
            id: userData.id,
            name: profileData?.name || userData.email?.split('@')[0] || '',
            email: userData.email || '',
            role: userRole,
            avatar: profileData?.avatar || '',
            department: null,
            department_id: profileData?.department_id || null,
            status: profileData?.status as 'active' | 'inactive' || 'active',
            maxSimultaneousChats: profileData?.max_simultaneous_chats || 5
          };
          
          console.log("Usuário configurado a partir da sessão:", user);
          if (isMounted) setCurrentUser(user);
          
        } catch (profileError: any) {
          console.error("Erro ao buscar perfil:", profileError.message || profileError);
        }
      } catch (error: any) {
        console.error("Verificação de sessão falhou:", error.message || error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Estado de autenticação alterado:", event);
      
      if (event === 'SIGNED_IN' && session) {
        // Deixe o processo de login lidar com isso, não duplique a busca de perfil aqui
        console.log("SIGNED_IN evento detectado, sessão disponível");
      } else if (event === 'SIGNED_OUT') {
        console.log("Usuário desconectado");
        if (isMounted) {
          setCurrentUser(null);
          setLoading(false);
        }
      }
    });
    
    // Check for current user
    checkCurrentUser();
    
    return () => {
      console.log("AuthProvider desmontado, limpeza");
      isMounted = false;
      clearTimeout(authTimeout);
      authListener?.subscription.unsubscribe();
    };
  }, [setCurrentUser, setLoading]);
  
  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated,
    userRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
