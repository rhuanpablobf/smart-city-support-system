
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
        console.log("Fetching conversation:", conversationId);
        
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            services(name),
            departments(name)
          `)
          .eq('id', conversationId)
          .single();

        if (error) {
          console.error("Error fetching conversation:", error);
          throw error;
        }
        
        console.log("Conversation data loaded:", data);
        setConversation(data);
      } catch (error: any) {
        console.error("Erro ao carregar conversa:", error);
        toast({
          title: "Erro ao carregar conversa",
          description: error.message || "Não foi possível carregar os detalhes da conversa. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();

    // Set up real-time updates for conversation status
    if (conversationId) {
      console.log("Setting up realtime subscription for conversation:", conversationId);
      
      const subscriptionIds = realtimeService.subscribeToTable('conversations', 'UPDATE', async (payload) => {
        if (payload.new && 
            'id' in payload.new && 
            payload.new.id === conversationId) {
          
          // Check status changes
          const oldStatus = payload.old && 
                          'status' in payload.old ? 
                          payload.old.status : null;
                          
          const newStatus = payload.new && 
                          'status' in payload.new ? 
                          payload.new.status : null;
          
          console.log(`Conversation ${conversationId} status changed: ${oldStatus} -> ${newStatus}`);
          
          // If status changed to 'active', reload the page to show chat
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
      
      setChannelIds(prevIds => [...prevIds, ...subscriptionIds]);
    }

    return () => {
      if (channelIds.length > 0) {
        console.log("Cleaning up conversation status subscriptions");
        realtimeService.unsubscribeAll(channelIds);
        setChannelIds([]);
      }
    };
  }, [conversationId, toast]);

  return { conversation, loading };
};
