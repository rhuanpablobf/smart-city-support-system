
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, AuthProviderProps } from './types';
import { useAuthService } from './useAuthService';
import { supabase } from '@/integrations/supabase/client';

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
        console.error("Verificação de autenticação expirou após 10 segundos");
        setLoading(false);
      }
    }, 10000); // 10 second timeout

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
        
        // Fetch the user profile from our profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error("Erro ao buscar perfil:", profileError.message);
          if (isMounted) setLoading(false);
          return;
        }
        
        if (!profileData) {
          console.log("Nenhum perfil encontrado para o usuário");
          if (isMounted) setLoading(false);
          return;
        }
        
        console.log("Perfil encontrado:", profileData.role);
        const user = {
          id: profileData.id,
          name: profileData.name || data.session.user.email?.split('@')[0] || '',
          email: profileData.email || data.session.user.email || '',
          role: profileData.role,
          avatar: profileData.avatar || '',
          department: profileData.department_id,
          maxSimultaneousChats: profileData.max_simultaneous_chats
        };
        
        if (isMounted) setCurrentUser(user);
        
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
