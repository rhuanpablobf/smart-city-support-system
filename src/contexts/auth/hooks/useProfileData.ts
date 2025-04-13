
import { useState } from 'react';
import { User } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import { fetchUserProfile } from '../userProfileService';

export function useProfileData() {
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const loadUserProfile = async (
    userId: string,
    setCurrentUser: (user: User | null) => void
  ): Promise<void> => {
    try {
      setLoading(true);
      
      const user = await fetchUserProfile(userId);
      setCurrentUser(user);
      
    } catch (error: any) {
      console.error('Error loading user profile:', error);
      toast({
        title: "Erro ao carregar perfil",
        description: error.message || "Não foi possível carregar os dados do usuário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { loadUserProfile, loading };
}
