
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useAgentTransfer = (conversationId: string | null) => {
  const [transferLoading, setTransferLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const transferToAgent = async () => {
    if (!conversationId) return;
    
    setTransferLoading(true);
    try {
      // Atualizar o status da conversa para 'waiting' para um atendente a pegar
      const { error } = await supabase
        .from('conversations')
        .update({ 
          status: 'waiting',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);
        
      if (error) throw error;
      
      // Adicionar uma mensagem de bot indicando a transferência
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: 'Cliente solicitou atendimento humano',
          sender_id: conversationId,
          sender_type: 'bot',
          timestamp: new Date().toISOString()
        });
        
      if (messageError) throw messageError;
      
      toast({
        title: "Transferência solicitada",
        description: "Você será atendido por um agente em breve.",
      });
      
      // Redirecionar para o chat com o mesmo ID de conversa
      navigate(`/chat?conversation=${conversationId}&waiting=true`);
    } catch (error) {
      console.error("Erro ao transferir para atendente:", error);
      toast({
        title: "Erro ao transferir",
        description: "Não foi possível solicitar atendimento humano. Tente novamente.",
        variant: "destructive"
      });
      setTransferLoading(false);
    }
  };

  return { transferLoading, transferToAgent };
};
