
import React, { ReactNode, useState, useCallback, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { AuthContextType, ROLE_HIERARCHY } from './types';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { fetchUserProfile } from './userProfileService';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const setupAuth = async () => {
      setLoading(true);
      console.log("Configurando autenticação...");
      
      try {
        // Set up auth listener BEFORE checking session
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, authSession) => {
            console.log("Auth state changed:", event, authSession?.user?.id);
            
            if (event === 'SIGNED_OUT') {
              console.log("Usuário desconectado");
              setCurrentUser(null);
              setIsAuthenticated(false);
              setUserRole(null);
              setLoading(false);
              return;
            }
            
            if (authSession?.user) {
              console.log("Usuário autenticado, carregando perfil...");
              try {
                const profile = await fetchUserProfile(authSession.user.id);
                
                if (profile) {
                  console.log("Perfil carregado:", profile);
                  setCurrentUser(profile);
                  setIsAuthenticated(true);
                  setUserRole(profile.role);
                } else {
                  console.log("Nenhum perfil encontrado");
                  setCurrentUser(null);
                  setIsAuthenticated(false);
                  setUserRole(null);
                }
              } catch (error) {
                console.error("Erro ao carregar perfil:", error);
                setCurrentUser(null);
                setIsAuthenticated(false);
                setUserRole(null);
              }
            } else {
              console.log("Nenhum usuário na sessão");
              setCurrentUser(null);
              setIsAuthenticated(false);
              setUserRole(null);
            }
            
            setLoading(false);
          }
        );

        // AFTER setting up listener, check initial session
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Erro ao obter sessão:", sessionError);
          setLoading(false);
          return;
        }
          
        if (data.session?.user) {
          console.log("Sessão inicial encontrada, carregando perfil...");
          try {
            const profile = await fetchUserProfile(data.session.user.id);
            
            if (profile) {
              console.log("Perfil inicial carregado:", profile);
              setCurrentUser(profile);
              setIsAuthenticated(true);
              setUserRole(profile.role);
            }
          } catch (profileError) {
            console.error("Erro ao carregar perfil inicial:", profileError);
          }
        } else {
          console.log("Nenhuma sessão inicial encontrada");
        }
        
        setLoading(false);
        
        return () => {
          console.log("Desativando listener de autenticação");
          subscription.unsubscribe();
        };
      } catch (setupError) {
        console.error("Erro ao configurar autenticação:", setupError);
        setLoading(false);
      }
    };
    
    setupAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Iniciando login com Supabase...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Erro de login Supabase:", error);
        setError(error.message);
        toast({
          title: "Erro ao logar",
          description: error.message || "Não foi possível logar. Tente novamente.",
          variant: "destructive"
        });
        throw error;
      }
      
      console.log("Login Supabase bem-sucedido", data.user?.id);
      // Auth state change listener will update the user state
      
    } catch (error: any) {
      console.error("Erro no processo de login:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
        toast({
          title: "Erro ao fazer logout",
          description: error.message || "Não foi possível fazer logout. Tente novamente.",
          variant: "destructive"
        });
        throw error;
      }
      // Auth state change listener will clear the user state
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const register = async (email: string, password: string, name: string, role: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (signupError) throw signupError;
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar seu cadastro.",
      });
      
      return signupData;
    } catch (error: any) {
      console.error("Erro ao registrar usuário:", error);
      setError(error.message || "Falha ao registrar. Tente novamente.");
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Não foi possível criar sua conta. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<User> => {
    setLoading(true);
    setError(null);
  
    try {
      if (!currentUser?.id) {
        throw new Error("User not authenticated");
      }
  
      // Centralize the update object
      const updates: { [key: string]: any } = {};
      if (userData.name !== undefined) updates.name = userData.name;
      if (userData.status !== undefined) updates.status = userData.status;
      if (userData.maxSimultaneousChats !== undefined) updates.max_simultaneous_chats = userData.maxSimultaneousChats;
  
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentUser.id)
        .select()
        .single();
  
      if (error) {
        console.error("Erro ao atualizar perfil:", error);
        setError(error.message);
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message || "Não foi possível atualizar seu perfil. Tente novamente.",
          variant: "destructive"
        });
        throw error;
      }
  
      const updatedUser: User = {
        ...currentUser,
        ...userData,
        name: data.name,
        status: data.status as "active" | "inactive",
        maxSimultaneousChats: data.max_simultaneous_chats
      };
  
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = useCallback((requiredRole: string): boolean => {
    if (!userRole) {
      console.log("hasPermission: No current user");
      return false;
    }
    const userRoleLevel = ROLE_HIERARCHY[userRole] || 0;
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 0;
    
    const hasRole = userRoleLevel >= requiredRoleLevel;
    console.log(`hasPermission: User role ${userRole} (${userRoleLevel}), required role ${requiredRole} (${requiredRoleLevel}), result: ${hasRole}`);
    return hasRole;
  }, [userRole]);

  const value: AuthContextType = {
    currentUser,
    login,
    logout,
    register,
    updateUser,
    loading,
    error,
    isAuthenticated,
    userRole,
    hasPermission,
    setCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
