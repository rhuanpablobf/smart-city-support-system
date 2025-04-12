
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, ROLE_HIERARCHY } from './types';

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions
    const getSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getSession();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, name, email, avatar, role, status, max_simultaneous_chats,
          department_id, departments:department_id(id, name)
        `)
        .eq('id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const serviceIdsResponse = await supabase
          .from('agent_services')
          .select('service_id')
          .eq('agent_id', userId);
          
        const serviceIds = serviceIdsResponse?.data?.map(item => item.service_id) || [];
        
        const user: User = {
          id: data.id,
          name: data.name || 'User',
          email: data.email || '',
          role: data.role,
          avatar: data.avatar || '',
          status: (data.status || 'active') as 'active' | 'inactive',
          department: data.departments,
          department_id: data.department_id,
          maxSimultaneousChats: data.max_simultaneous_chats || 5,
          serviceIds
        };
        
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };
  
  const login = async (email: string, password: string): Promise<User | void> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        await fetchUserProfile(data.user.id);
        return currentUser!; // Return user after login
      }
    } catch (error: any) {
      console.error('Login error:', error.message);
      throw error;
    }
  };
  
  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
    } catch (error: any) {
      console.error('Logout error:', error.message);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<User> => {
    try {
      if (!currentUser) throw new Error("No user is currently logged in");

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
        .eq('id', currentUser.id);

      if (error) throw error;

      // Update local state
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      
      return updatedUser;
    } catch (error: any) {
      console.error('Update user error:', error.message);
      throw error;
    }
  };
  
  // Check if the user has a specific role or higher
  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!currentUser) return false;
    
    const userRoleLevel = ROLE_HIERARCHY[currentUser.role] || 0;
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 0;
    
    return userRoleLevel >= requiredRoleLevel;
  };
  
  const value = {
    currentUser,
    setCurrentUser,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!currentUser,
    userRole: currentUser?.role || null,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
