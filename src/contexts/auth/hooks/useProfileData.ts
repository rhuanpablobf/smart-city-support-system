
import { useState, useEffect } from 'react';
import { User } from '@/types';
import { useAuth } from '../useAuth';
import { fetchUserProfile } from '../userProfileService';

export function useProfileData() {
  const { currentUser, setCurrentUser } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshUserProfile = async () => {
    if (!currentUser?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Atualizando perfil do usuário...");
      const updatedProfile = await fetchUserProfile(currentUser.id);
      
      if (updatedProfile) {
        console.log("Perfil atualizado:", updatedProfile);
        setCurrentUser(updatedProfile);
      }
    } catch (err: any) {
      console.error("Erro ao atualizar perfil:", err);
      setError(err.message || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  return {
    userProfile: currentUser,
    loading,
    error,
    refreshUserProfile
  };
}
