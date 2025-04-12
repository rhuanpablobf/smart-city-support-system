
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Clock
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface QA {
  id: string;
  question: string;
  answer: string;
  hasImage: boolean;
  imageUrl?: string;
  hasLink: boolean;
  linkUrl?: string;
  linkText?: string;
}

const FAQ: React.FC = () => {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversationId');
  const serviceId = searchParams.get('serviceId');
  const navigate = useNavigate();
  const [qaItems, setQaItems] = useState<QA[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceName, setServiceName] = useState('');
  const [isRequestingAgent, setIsRequestingAgent] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const { toast } = useToast();

  // Buscar perguntas e respostas para este serviço
  useEffect(() => {
    const fetchQA = async () => {
      if (!serviceId || !conversationId) return;

      try {
        // Buscar nome do serviço
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('name')
          .eq('id', serviceId)
          .single();

        if (serviceError) throw serviceError;
        if (serviceData) setServiceName(serviceData.name);

        // Buscar perguntas e respostas
        const { data, error } = await supabase
          .from('qa_items')
          .select('*')
          .eq('service_id', serviceId)
          .order('question');

        if (error) throw error;
        setQaItems(data.map(item => ({
          id: item.id,
          question: item.question,
          answer: item.answer,
          hasImage: item.has_image || false,
          imageUrl: item.image_url,
          hasLink: item.has_link || false,
          linkUrl: item.link_url,
          linkText: item.link_text
        })));
      } catch (err) {
        console.error('Erro ao buscar perguntas e respostas:', err);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as perguntas frequentes",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQA();
  }, [serviceId, conversationId, toast]);

  // Solicitar atendimento por um agente
  const requestAgent = async () => {
    if (!conversationId) return;

    try {
      setIsRequestingAgent(true);
      
      // Atualizar status da conversa para "waiting"
      const { error } = await supabase
        .from('conversations')
        .update({ 
          status: 'waiting',
          last_message_at: new Date().toISOString() 
        })
        .eq('id', conversationId);

      if (error) throw error;

      toast({
        title: "Aguardando atendente",
        description: "Você foi adicionado à fila de espera",
      });
      
      // Iniciar monitoramento da posição na fila
      monitorQueuePosition();
    } catch (err) {
      console.error('Erro ao solicitar atendente:', err);
      toast({
        title: "Erro",
        description: "Não foi possível solicitar um atendente",
        variant: "destructive"
      });
      setIsRequestingAgent(false);
    }
  };
  
  // Monitorar posição na fila
  const monitorQueuePosition = () => {
    // Função para verificar a posição na fila
    const checkQueuePosition = async () => {
      if (!conversationId) return;
      
      try {
        // Verificar se a conversa foi aceita por um agente
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .select('status, agent_id')
          .eq('id', conversationId)
          .single();
          
        if (convError) throw convError;
        
        // Se a conversa foi aceita, redirecionar para o chat
        if (convData.status === 'active' && convData.agent_id) {
          navigate(`/chat?conversationId=${conversationId}`);
          return;
        }
        
        // Se ainda está em espera, verificar a posição na fila
        if (convData.status === 'waiting') {
          // Buscar todas as conversas em espera ordenadas por timestamp
          const { data: waitingList, error: waitingError } = await supabase
            .from('conversations')
            .select('id')
            .eq('status', 'waiting')
            .order('created_at', { ascending: true });
            
          if (waitingError) throw waitingError;
          
          // Encontrar a posição desta conversa na fila
          const position = waitingList.findIndex(item => item.id === conversationId) + 1;
          setQueuePosition(position);
        } else {
          // Se não está mais em espera nem ativa, deve ter sido cancelada
          toast({
            title: "Atendimento cancelado",
            description: "Sua solicitação de atendimento foi cancelada",
            variant: "destructive"
          });
          setIsRequestingAgent(false);
          setQueuePosition(null);
        }
      } catch (err) {
        console.error('Erro ao verificar posição na fila:', err);
      }
    };
    
    // Verificar imediatamente
    checkQueuePosition();
    
    // Continuar verificando a cada 5 segundos
    const interval = setInterval(checkQueuePosition, 5000);
    
    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(interval);
  };
  
  // Cancelar solicitação de atendente
  const cancelRequest = async () => {
    if (!conversationId) return;
    
    try {
      // Atualizar status da conversa de volta para "bot"
      const { error } = await supabase
        .from('conversations')
        .update({ 
          status: 'bot',
          last_message_at: new Date().toISOString() 
        })
        .eq('id', conversationId);
        
      if (error) throw error;
      
      setIsRequestingAgent(false);
      setQueuePosition(null);
      
      toast({
        title: "Solicitação cancelada",
        description: "Você saiu da fila de espera",
      });
    } catch (err) {
      console.error('Erro ao cancelar solicitação:', err);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a solicitação",
        variant: "destructive"
      });
    }
  };

  // Voltar para a página anterior
  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-blue-500 rounded-b-[30%] -z-10 transform rotate-6 translate-y-[-40%] translate-x-[5%]"></div>
      
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold mb-2">{serviceName}</h1>
            
            {isRequestingAgent ? (
              <div className="bg-blue-50 p-6 rounded-lg mb-6 text-center">
                <div className="flex justify-center mb-4">
                  <Clock className="h-12 w-12 text-blue-500 animate-pulse" />
                </div>
                <h2 className="text-xl font-bold mb-2">Aguardando atendente</h2>
                
                {queuePosition && (
                  <div className="mb-4">
                    <p className="text-gray-600">Sua posição na fila:</p>
                    <div className="text-3xl font-bold text-blue-600 mt-2">{queuePosition}º</div>
                  </div>
                )}
                
                <p className="text-gray-600 mb-4">
                  Por favor, aguarde enquanto conectamos você a um atendente disponível.
                </p>
                
                <Button variant="outline" onClick={cancelRequest}>
                  Cancelar solicitação
                </Button>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Encontre abaixo as respostas para as perguntas mais frequentes sobre {serviceName}. 
                  Se não encontrar o que procura, você pode iniciar um atendimento com um de nossos atendentes.
                </p>
                
                {qaItems.length > 0 ? (
                  <div className="mb-8">
                    <Accordion type="single" collapsible className="w-full">
                      {qaItems.map((item, index) => (
                        <AccordionItem value={item.id} key={item.id}>
                          <AccordionTrigger className="text-left font-medium text-base hover:text-blue-600 py-4">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="pt-0 pb-4 text-gray-600">
                            <div className="prose prose-sm max-w-none">
                              <p>{item.answer}</p>
                              
                              {item.hasImage && item.imageUrl && (
                                <img 
                                  src={item.imageUrl} 
                                  alt="Imagem explicativa" 
                                  className="my-4 rounded-md max-w-full h-auto" 
                                />
                              )}
                              
                              {item.hasLink && item.linkUrl && (
                                <a 
                                  href={item.linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:underline inline-block mt-2"
                                >
                                  {item.linkText || "Saiba mais"}
                                </a>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ) : (
                  <div className="text-center py-8 mb-6">
                    <p className="text-gray-500">Nenhuma pergunta frequente disponível para este serviço.</p>
                  </div>
                )}
                
                <Separator className="my-6" />
                
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Ainda precisa de ajuda? Fale com um de nossos atendentes.</p>
                  
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
                    <Button variant="outline" onClick={goBack} className="flex items-center">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    
                    <Button onClick={requestAgent} className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" /> Falar com Atendente
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
