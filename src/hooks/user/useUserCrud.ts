
import { useState } from 'react';
import { User, UserFormValues } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useUserCrud = (refreshUsers: () => Promise<any>) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Add new user
  const addUser = async (userData: UserFormValues): Promise<User> => {
    setLoading(true);
    
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password || generateRandomPassword(),
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      });
      
      if (authError) throw new Error(authError.message);
      
      if (!authData.user) {
        throw new Error('Falha ao criar usuário');
      }
      
      // Create or update profile record
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          name: userData.name,
          email: userData.email,
          role: userData.role as any, // Type assertion to bypass type checking
          department_id: userData.department_id || null,
          status: userData.status || 'active',
          max_simultaneous_chats: userData.maxSimultaneousChats || 5
        })
        .select()
        .single();
      
      if (profileError) throw new Error(profileError.message);
      
      // If services are selected, create agent_services records
      if (userData.serviceIds && userData.serviceIds.length > 0) {
        const serviceRecords = userData.serviceIds.map(serviceId => ({
          agent_id: authData.user!.id,
          service_id: serviceId
        }));
        
        const { error: servicesError } = await supabase
          .from('agent_services')
          .insert(serviceRecords);
        
        if (servicesError) throw new Error(servicesError.message);
      }
      
      // Refresh the user list
      await refreshUsers();
      
      return {
        id: authData.user.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department_id: userData.department_id || null,
        status: userData.status || 'active',
        maxSimultaneousChats: userData.maxSimultaneousChats || 5,
        avatar: '',
        department: null
      };
    } catch (error: any) {
      console.error('Error adding user:', error);
      throw new Error(error.message || 'Falha ao adicionar usuário');
    } finally {
      setLoading(false);
    }
  };
  
  // Update existing user
  const updateUser = async (userId: string, userData: Partial<UserFormValues>): Promise<User> => {
    setLoading(true);
    
    try {
      // Update profile record
      const updates: any = {
        name: userData.name,
        role: userData.role as any, // Type assertion to bypass type checking
        department_id: userData.department_id,
        status: userData.status,
        max_simultaneous_chats: userData.maxSimultaneousChats
      };
      
      // Filter out undefined values
      Object.keys(updates).forEach(key => {
        if (updates[key] === undefined) {
          delete updates[key];
        }
      });
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (profileError) throw new Error(profileError.message);
      
      // If services are provided, update agent_services
      if (userData.serviceIds !== undefined) {
        // First, delete all existing services for this agent
        const { error: deleteError } = await supabase
          .from('agent_services')
          .delete()
          .eq('agent_id', userId);
        
        if (deleteError) throw new Error(deleteError.message);
        
        // Then, insert the new services
        if (userData.serviceIds.length > 0) {
          const serviceRecords = userData.serviceIds.map(serviceId => ({
            agent_id: userId,
            service_id: serviceId
          }));
          
          const { error: servicesError } = await supabase
            .from('agent_services')
            .insert(serviceRecords);
          
          if (servicesError) throw new Error(servicesError.message);
        }
      }
      
      // If password is provided, update it
      if (userData.password) {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          userId,
          { password: userData.password }
        );
        
        if (passwordError) throw new Error(passwordError.message);
      }
      
      // Refresh the user list
      await refreshUsers();
      
      return {
        id: userId,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        department_id: profile.department_id,
        status: profile.status as 'active' | 'inactive',
        maxSimultaneousChats: profile.max_simultaneous_chats,
        avatar: profile.avatar || '',
        department: null
      };
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw new Error(error.message || 'Falha ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete user
  const deleteUser = async (userId: string): Promise<void> => {
    setLoading(true);
    
    try {
      // Delete the auth user (this will cascade to profiles)
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw new Error(error.message);
      
      // Refresh the user list
      await refreshUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw new Error(error.message || 'Falha ao excluir usuário');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to generate a random password
  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-2) + '!';
  };
  
  return {
    addUser,
    updateUser,
    deleteUser,
    loading
  };
};
