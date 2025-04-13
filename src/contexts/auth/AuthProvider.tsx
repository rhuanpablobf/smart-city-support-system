
import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from './AuthContext';
import { useAuthService } from './useAuthService';
import { useProfileData } from './hooks/useProfileData';

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authService = useAuthService();
  const { loadUserProfile, loading: profileLoading } = useProfileData();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionError, setSessionError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log("AuthProvider - Inicializando e verificando sessão");
    let isMounted = true;

    // First set up the auth state listener before checking for an existing session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("AuthState change event:", event, "session exists:", !!session);

        if (!isMounted) return;
        
        if (event === 'SIGNED_IN' && session?.user) {
          // We'll handle profile fetching separately to avoid deadlocks
          setTimeout(async () => {
            if (!isMounted) return;
            await loadUserProfile(
              session.user.id,
              authService.setCurrentUser
            );
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          console.log("Usuário desconectado, limpando estado");
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
          console.log("Sessão existente encontrada, buscando perfil do usuário");
          await loadUserProfile(
            session.user.id,
            authService.setCurrentUser
          );
        } else {
          console.log("Nenhuma sessão encontrada ou componente desmontado");
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
  
  // Adicionar refresh token periódico para manter sessão ativa
  useEffect(() => {
    if (!authService.currentUser) return;
    
    const refreshInterval = setInterval(async () => {
      try {
        // Refresh da sessão para evitar expiração
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.warn("Erro ao atualizar sessão:", error);
        }
      } catch (err) {
        console.error("Erro no refresh da sessão:", err);
      }
    }, 5 * 60 * 1000); // 5 minutos
    
    return () => clearInterval(refreshInterval);
  }, [authService.currentUser]);
  
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
  
  const value = {
    ...authService,
    updateUser,
    loading: authService.loading || profileLoading || !sessionChecked
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
