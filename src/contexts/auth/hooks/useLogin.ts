
import { useState } from 'react';
import { User } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

export function useLogin() {
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log("Iniciando login com Supabase...");
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Erro de login Supabase:", error);
        throw error;
      }
      
      if (!data.user) {
        console.error("Login retornou sem usuário");
        throw new Error("Não foi possível autenticar o usuário");
      }
      
      console.log("Login Supabase bem-sucedido");
      
      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo de volta!`,
      });
      
      return data.user;
    } catch (error: any) {
      console.error("Login falhou com erro:", error);
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

  return {
    login,
    loading
  };
}
