
import React, { createContext, useContext, useEffect } from 'react';
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
    const checkCurrentUser = async () => {
      try {
        console.log("Checking current session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error.message);
          setLoading(false);
          return;
        }
        
        if (session) {
          console.log("Session found, user is logged in");
          // Fetch the user profile from our profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error("Error fetching profile:", profileError.message);
            setLoading(false);
            return;
          }
          
          if (profileData) {
            console.log("Profile found:", profileData.role);
            const user = {
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
        } else {
          console.log("No session found, user is not logged in");
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
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_IN' && session) {
        // Fetch the profile after sign in
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileData) {
          console.log("Profile loaded after auth state change:", profileData.role);
          const user = {
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
        console.log("User signed out");
        setCurrentUser(null);
      }
    });
    
    return () => {
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
