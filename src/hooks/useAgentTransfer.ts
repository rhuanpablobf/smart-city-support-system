
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useAgentTransfer = (conversationId: string | null) => {
  const [transferLoading, setTransferLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const transferToAgent = async () => {
    if (!conversationId) {
      toast({
        title: "Erro na transferência",
        description: "ID da conversa não disponível",
        variant: "destructive"
      });
      return;
    }
    
    setTransferLoading(true);
    try {
      console.log(`Transferindo conversa ${conversationId} para atendimento humano`);
      
      // Verificar primeiro se a conversa existe
      const { data: conversationCheck, error: checkError } = await supabase
        .from('conversations')
        .select('id, status')
        .eq('id', conversationId)
        .single();
        
      if (checkError) {
        console.error("Erro ao verificar conversa:", checkError);
        throw new Error("Conversa não encontrada");
      }
      
      if (conversationCheck.status === 'waiting' || conversationCheck.status === 'active') {
        toast({
          title: "Transferência já solicitada",
          description: "Esta conversa já está em atendimento ou na fila de espera.",
          variant: "default"
        });
        setTransferLoading(false);
        return;
      }
      
      // Atualizar o status da conversa para 'waiting' para um atendente a pegar
      const { error } = await supabase
        .from('conversations')
        .update({ 
          status: 'waiting',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);
        
      if (error) throw error;
      
      // Adicionar uma mensagem de sistema indicando a transferência
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: 'Cliente solicitou atendimento humano. Aguardando na fila.',
          sender_id: 'system',
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
    } finally {
      setTransferLoading(false);
    }
  };

  return { transferLoading, transferToAgent };
};
