
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface QAItem {
  id: string;
  question: string;
  answer: string;
  has_link: boolean;
  link_url?: string;
  link_text?: string;
  has_image: boolean;
  image_url?: string;
}

export interface ServiceInfo {
  name: string;
  department: string;
}

export const useFAQData = (conversationId: string | null) => {
  const [loading, setLoading] = useState(true);
  const [qaItems, setQaItems] = useState<QAItem[]>([]);
  const [serviceInfo, setServiceInfo] = useState<ServiceInfo | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConversationDetails = async () => {
      if (!conversationId) {
        setLoading(false);
        return;
      }

      try {
        // Buscar detalhes da conversa
        const { data: conversation, error: conversationError } = await supabase
          .from('conversations')
          .select(`
            service_id,
            department_id,
            services(name),
            departments(name)
          `)
          .eq('id', conversationId)
          .single();

        if (conversationError) {
          throw conversationError;
        }

        if (conversation && conversation.service_id) {
          setServiceInfo({
            name: conversation.services?.name || 'Serviço',
            department: conversation.departments?.name || 'Departamento'
          });

          // Buscar as perguntas e respostas para o serviço
          const { data: qaData, error: qaError } = await supabase
            .from('qa_items')
            .select('*')
            .eq('service_id', conversation.service_id);

          if (qaError) {
            throw qaError;
          }

          console.log("QA items carregados:", qaData?.length || 0);
          setQaItems(qaData || []);
        }
      } catch (error) {
        console.error("Erro ao carregar perguntas frequentes:", error);
        toast({
          title: "Erro ao carregar informações",
          description: "Não foi possível carregar as perguntas frequentes. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConversationDetails();
  }, [conversationId, toast]);

  return { loading, qaItems, serviceInfo };
};
