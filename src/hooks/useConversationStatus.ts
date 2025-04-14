
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { realtimeService } from '@/services/realtime/realtimeService';

export const useConversationStatus = (conversationId: string | null) => {
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [channelIds, setChannelIds] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConversation = async () => {
      if (!conversationId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            services(name),
            departments(name)
          `)
          .eq('id', conversationId)
          .single();

        if (error) throw error;
        
        setConversation(data);
      } catch (error) {
        console.error("Erro ao carregar conversa:", error);
        toast({
          title: "Erro ao carregar conversa",
          description: "Não foi possível carregar os detalhes da conversa. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();

    // Configura real-time updates para status da conversa
    if (conversationId) {
      const subscriptionIds = realtimeService.subscribeToTable('conversations', 'UPDATE', async (payload) => {
        if (payload.new && 
            'id' in payload.new && 
            payload.new.id === conversationId) {
          
          // Verificar se payload.old e payload.new existem e têm a propriedade status
          const oldStatus = payload.old && 
                          'status' in payload.old ? 
                          payload.old.status : null;
                          
          const newStatus = payload.new && 
                          'status' in payload.new ? 
                          payload.new.status : null;
          
          console.log(`Conversa ${conversationId} mudou de status: ${oldStatus} -> ${newStatus}`);
          
          // Se o status mudou para 'active', recarregar a página para mostrar o chat
          if (newStatus === 'active' && oldStatus === 'waiting') {
            toast({
              title: "Atendimento iniciado!",
              description: "Um agente aceitou seu atendimento. Atualizando a página...",
            });
            setTimeout(() => window.location.reload(), 2000);
          } else {
            setConversation(payload.new);
          }
        }
      });
      
      setChannelIds((prevIds) => [...prevIds, ...subscriptionIds]);
    }

    return () => {
      if (channelIds.length > 0) {
        realtimeService.unsubscribeAll(channelIds);
      }
    };
  }, [conversationId, toast]);

  return { conversation, loading };
};
