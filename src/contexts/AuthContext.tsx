
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  hasPermission: (requiredRole: UserRole) => boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ROLE_HIERARCHY: { [key in UserRole]: number } = {
  'admin': 3,
  'manager': 2,
  'agent': 1,
  'user': 0,
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Check if user is already logged in with Supabase
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error.message);
          return;
        }
        
        if (session) {
          // Fetch the user profile from our profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error("Error fetching profile:", profileError.message);
            return;
          }
          
          if (profileData) {
            const user: User = {
              id: profileData.id,
              name: profileData.name || session.user.email?.split('@')[0] || '',
              email: profileData.email || session.user.email || '',
              role: profileData.role,
              avatar: profileData.avatar || '',
              department: profileData.department_id,
              maxSimultaneousChats: profileData.max_simultaneous_chats
            };
            setCurrentUser(user);
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkCurrentUser();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Fetch the profile after sign in
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileData) {
          const user: User = {
            id: profileData.id,
            name: profileData.name || session.user.email?.split('@')[0] || '',
            email: profileData.email || session.user.email || '',
            role: profileData.role,
            avatar: profileData.avatar || '',
            department: profileData.department_id,
            maxSimultaneousChats: profileData.max_simultaneous_chats
          };
          setCurrentUser(user);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
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
        
        setCurrentUser(user);
        
        toast({
          title: "Login bem-sucedido",
          description: `Bem-vindo de volta, ${user.name}!`,
        });
      }
    } catch (error: any) {
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

  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated: !!currentUser,
    userRole: currentUser?.role || null,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
