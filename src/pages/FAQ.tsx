
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CircleHelp, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface QAItem {
  id: string;
  question: string;
  answer: string;
  has_link: boolean;
  link_url?: string;
  link_text?: string;
  has_image: boolean;
  image_url?: string;
}

const FAQ = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [qaItems, setQaItems] = useState<QAItem[]>([]);
  const [serviceInfo, setServiceInfo] = useState<{ name: string; department: string } | null>(null);
  const { toast } = useToast();
  
  const conversationId = searchParams.get('conversationId');
  
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

  const redirectToChat = () => {
    if (conversationId) {
      window.location.href = `/chat?conversation=${conversationId}`;
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-chatbot-primary" />
          <h2 className="text-xl font-medium text-gray-900">Carregando...</h2>
          <p className="text-gray-500 mt-2">Estamos buscando informações para você</p>
        </div>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <CircleHelp className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-medium text-gray-900">Conversa não encontrada</h2>
          <p className="text-gray-500 mt-2">Não foi possível encontrar os detalhes desta conversa</p>
          <Button className="mt-4" onClick={() => window.location.href = "/"}>
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  if (qaItems.length === 0) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <CircleHelp className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-xl font-medium text-gray-900">Sem perguntas frequentes disponíveis</h2>
          <p className="text-gray-500 mt-2">Não encontramos perguntas frequentes para este serviço</p>
          <Button className="mt-4" onClick={redirectToChat}>
            Ir para o Atendimento
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <CircleHelp className="h-12 w-12 mx-auto mb-3 text-chatbot-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Perguntas Frequentes</h1>
          {serviceInfo && (
            <p className="text-gray-600 mt-1">{serviceInfo.department} - {serviceInfo.name}</p>
          )}
        </div>

        <div className="space-y-4 mb-8">
          {qaItems.map((item) => (
            <Card key={item.id} className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-medium text-lg text-gray-900 mb-2">{item.question}</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{item.answer}</p>
                
                {item.has_link && item.link_url && item.link_text && (
                  <a 
                    href={item.link_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-chatbot-primary hover:text-chatbot-dark flex items-center mt-3"
                  >
                    {item.link_text}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                )}
                
                {item.has_image && item.image_url && (
                  <div className="mt-3">
                    <img 
                      src={item.image_url} 
                      alt="Imagem ilustrativa" 
                      className="max-w-full h-auto rounded-md" 
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">Não encontrou o que procurava?</p>
          <Button onClick={redirectToChat} className="bg-chatbot-primary hover:bg-chatbot-dark">
            Falar com Atendente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
