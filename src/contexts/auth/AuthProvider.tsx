
import React, { ReactNode, useState, useCallback, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { AuthContextType, ROLE_HIERARCHY } from './types';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const setupAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      // Set up auth listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, authSession) => {
          if (authSession?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authSession.user.id)
              .single();

            if (profile) {
              setCurrentUser({
                id: authSession.user.id,
                email: authSession.user.email || '',
                name: profile.name,
                role: profile.role,
                status: profile.status || 'active',
                maxSimultaneousChats: profile.max_simultaneous_chats
              });
              setIsAuthenticated(true);
              setUserRole(profile.role);
            } else {
              setIsAuthenticated(false);
              setUserRole(null);
            }
          } else {
            setCurrentUser(null);
            setIsAuthenticated(false);
            setUserRole(null);
          }
          setLoading(false);
        }
      );

      // Initial session check
      if (data.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
          
        if (profile) {
          setCurrentUser({
            id: data.session.user.id,
            email: data.session.user.email || '',
            name: profile.name,
            role: profile.role,
            status: profile.status || 'active',
            maxSimultaneousChats: profile.max_simultaneous_chats
          });
          setIsAuthenticated(true);
          setUserRole(profile.role);
        }
      }
      
      setLoading(false);
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    setupAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        toast({
          title: "Erro ao logar",
          description: error.message || "Não foi possível logar. Tente novamente.",
          variant: "destructive"
        });
        throw error;
      }
    } catch (error: any) {
      setError(error.message);
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
      setCurrentUser(null);
      setIsAuthenticated(false);
      setUserRole(null);
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
