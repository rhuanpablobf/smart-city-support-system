
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
        if (payload.new && payload.new.id === conversationId) {
          // Check if payload.old and payload.new both exist and have status property
          const oldStatus = payload.old && typeof payload.old === 'object' && 'status' in payload.old ? payload.old.status : null;
          const newStatus = payload.new && typeof payload.new === 'object' && 'status' in payload.new ? payload.new.status : null;
          
          // Se o status mudou para 'active', recarregar a página para mostrar o chat
          if (newStatus === 'active' && oldStatus === 'waiting') {
            window.location.reload();
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
