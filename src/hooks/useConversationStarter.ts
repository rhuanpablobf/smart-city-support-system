
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

interface ConversationStarterProps {
  selectedDepartment: string;
  selectedService: string;
  cpf: string;
  isValidCPF: (cpf: string) => boolean;
}

export const useConversationStarter = ({
  selectedDepartment,
  selectedService,
  cpf,
  isValidCPF
}: ConversationStarterProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const startConversation = async () => {
    if (!selectedDepartment || !selectedService || !cpf) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos para iniciar o atendimento.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidCPF(cpf)) {
      toast({
        title: "CPF inválido",
        description: "Por favor, informe um CPF válido com 11 dígitos.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      // Generate a random user ID for anonymous users
      const userId = crypto.randomUUID();
      
      console.log("Criando conversa com:", {
        user_cpf: cpf,
        user_id: userId,
        department_id: selectedDepartment,
        service_id: selectedService
      });
      
      // Create a new conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          user_cpf: cpf,
          user_id: userId,
          department_id: selectedDepartment,
          service_id: selectedService,
          status: 'bot'
        })
        .select()
        .single();

      if (error) {
        console.error("Detalhes do erro:", error);
        throw error;
      }
      
      console.log("Conversa criada com sucesso:", conversation);
      
      // Mostrar toast de sucesso
      toast({
        title: "Conversa iniciada",
        description: "Redirecionando para o atendimento...",
      });
      
      // Redirect to the FAQ page with the new conversation ID
      setTimeout(() => {
        navigate(`/faq?conversationId=${conversation.id}`);
      }, 500);
    } catch (error: any) {
      console.error("Erro ao iniciar conversa:", error);
      toast({
        title: "Erro ao iniciar conversa",
        description: error.message || "Não foi possível iniciar a conversa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    startConversation
  };
};
