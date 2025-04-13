
import { useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

export function useLogout() {
  const { toast } = useToast();

  const logout = useCallback(async () => {
    try {
      console.log("Realizando logout...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erro no logout:", error);
        throw error;
      }
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro no logout:", error);
      toast({
        title: "Erro ao desconectar",
        description: error.message || "Ocorreu um erro ao tentar desconectar",
        variant: "destructive",
      });
    }
  }, [toast]);

  return logout;
}
