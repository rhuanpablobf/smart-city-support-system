
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

  const [authError, setAuthError] = useState<string | null>(null);

  // Check if user is already logged in with Supabase
  useEffect(() => {
    console.log("AuthProvider mounted, initializing auth check");
    let isMounted = true;
    let authTimeout: NodeJS.Timeout;

    // Set a global timeout to prevent being stuck in loading state
    authTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.error("Auth check timed out after 15 seconds");
        setLoading(false);
        setAuthError("Timeout checking authentication status");
      }
    }, 15000); // 15 second timeout

    const checkCurrentUser = async () => {
      try {
        console.log("Checking current session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error.message);
          if (isMounted) {
            setLoading(false);
            setAuthError(error.message);
          }
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
            if (isMounted) {
              setLoading(false);
              setAuthError(profileError.message);
            }
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
            if (isMounted) setCurrentUser(user);
          } else {
            console.log("No profile found for user");
            if (isMounted) setAuthError("No profile found for user");
          }
        } else {
          console.log("No session found, user is not logged in");
        }
      } catch (error: any) {
        console.error("Session check failed:", error.message || error);
        if (isMounted) setAuthError(error.message || "Unknown error checking session");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    // Set up auth state listener first
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_IN' && session) {
        if (!isMounted) return;
        
        try {
          // Fetch the profile after sign in
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile after auth change:", profileError.message);
            if (isMounted) setAuthError(profileError.message);
            return;
          }
            
          if (profileData && isMounted) {
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
          } else {
            console.log("No profile found after auth change");
            if (isMounted) setAuthError("No profile found for user");
          }
        } catch (error: any) {
          console.error("Error processing auth state change:", error.message || error);
          if (isMounted) setAuthError(error.message || "Error processing auth change");
        } finally {
          if (isMounted) setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        if (isMounted) {
          setCurrentUser(null);
          setLoading(false);
        }
      }
    });
    
    // Then check for current user
    checkCurrentUser();
    
    return () => {
      console.log("AuthProvider unmounting, cleanup");
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
