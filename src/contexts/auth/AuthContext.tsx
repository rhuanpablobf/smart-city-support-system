
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
        
        // Em vez de buscar o perfil, usamos os metadados do usuário
        const userData = data.session.user;
        const userMetadata = userData.user_metadata;
        
        // Determinar o papel do usuário com base no email
        const determineRole = (email: string): 'admin' | 'manager' | 'agent' | 'user' => {
          if (email.includes('admin')) return 'admin';
          if (email.includes('manager')) return 'manager';
          if (email.includes('agent')) return 'agent';
          return 'user';
        };
        
        // Criar o objeto de usuário usando os metadados
        const user = {
          id: userData.id,
          name: userMetadata?.name || userData.email?.split('@')[0] || '',
          email: userData.email || '',
          role: determineRole(userData.email || ''),
          avatar: userMetadata?.avatar || '',
          department: null,
          status: 'active', // Add default status
          maxSimultaneousChats: 5
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
