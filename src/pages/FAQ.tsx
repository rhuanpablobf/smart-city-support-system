
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, MessageSquare } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const FAQ = () => {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversationId');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [qaItems, setQaItems] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [checkingAgents, setCheckingAgents] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [inQueue, setInQueue] = useState(false);

  useEffect(() => {
    const loadFAQs = async () => {
      if (!conversationId) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        // Fetch conversation data
        const { data: conversationData, error: conversationError } = await supabase
          .from('conversations')
          .select('*, departments(name), services(name, id)')
          .eq('id', conversationId)
          .single();

        if (conversationError) throw conversationError;
        setConversation(conversationData);

        // Fetch QA items for the service
        const { data: qaData, error: qaError } = await supabase
          .from('qa_items')
          .select('*')
          .eq('service_id', conversationData.service_id);

        if (qaError) throw qaError;
        setQaItems(qaData || []);

      } catch (error) {
        console.error("Error loading FAQ data:", error);
        toast({
          title: "Erro ao carregar informações",
          description: "Não foi possível carregar as perguntas e respostas. Por favor, tente novamente.",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadFAQs();
  }, [conversationId, navigate, toast]);

  const startChat = async () => {
    if (!conversationId || !conversation) return;
    
    setCheckingAgents(true);
    try {
      // Check for available agents
      const { data: agentsData, error: agentsError } = await supabase
        .from('agent_statuses')
        .select('id')
        .eq('status', 'online')
        .lt('active_chats', 5);
        
      if (agentsError) throw agentsError;

      if (agentsData && agentsData.length > 0) {
        // There are available agents, update conversation status to waiting
        await supabase
          .from('conversations')
          .update({ status: 'waiting' })
          .eq('id', conversationId);
          
        // Redirect to chat screen
        navigate(`/chat?conversationId=${conversationId}`);
      } else {
        // No available agents, put in queue
        setInQueue(true);
        // Add to queue and get position
        const { data: queueData, error: queueError } = await supabase
          .from('conversations')
          .update({ 
            status: 'waiting'
          })
          .eq('id', conversationId)
          .select();
          
        if (queueError) throw queueError;
        
        // Get the queue position
        const { data: countData, error: countError } = await supabase
          .from('conversations')
          .select('id', { count: 'exact' })
          .eq('status', 'waiting');
          
        if (countError) throw countError;
        
        setQueuePosition(countData?.length || 1);
        
        // Start polling for position updates
        startQueuePositionPolling();
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast({
        title: "Erro ao iniciar chat",
        description: "Não foi possível conectar ao atendimento. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setCheckingAgents(false);
    }
  };

  const startQueuePositionPolling = () => {
    // Poll every 5 seconds for queue position updates
    const interval = setInterval(async () => {
      try {
        // Check if the conversation is still in queue
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .select('status')
          .eq('id', conversationId)
          .single();
          
        if (convError) throw convError;
        
        if (convData?.status === 'active') {
          // Conversation is now active, redirect to chat
          clearInterval(interval);
          navigate(`/chat?conversationId=${conversationId}`);
          return;
        }
        
        // Get current queue position
        const { data: waitingData, error: waitingError } = await supabase
          .from('conversations')
          .select('id')
          .eq('status', 'waiting')
          .order('created_at', { ascending: true });
          
        if (waitingError) throw waitingError;
        
        const position = waitingData.findIndex(c => c.id === conversationId) + 1;
        setQueuePosition(position > 0 ? position : 1);
        
      } catch (error) {
        console.error("Error checking queue position:", error);
      }
    }, 5000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  };

  const goBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            {inQueue ? (
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Aguardando na Fila</h2>
                <div className="mb-6">
                  <div className="text-5xl font-bold text-blue-600 mb-2">{queuePosition}</div>
                  <p className="text-gray-600">Sua posição na fila</p>
                </div>
                <p className="mb-6 text-gray-700">
                  Aguarde enquanto conectamos você com o próximo atendente disponível.
                  Assim que for sua vez, você será redirecionado automaticamente para o chat.
                </p>
                <Button 
                  variant="outline" 
                  onClick={goBack} 
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Cancelar e Voltar
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-semibold mb-6">
                  {conversation?.services?.name || "Perguntas Frequentes"}
                </h1>
                <p className="text-gray-600 mb-6">
                  Encontre abaixo as respostas para as perguntas mais frequentes sobre {conversation?.services?.name}.
                  Se não encontrar o que procura, você pode iniciar um atendimento com um de nossos atendentes.
                </p>
                
                <div className="space-y-6">
                  {qaItems.length > 0 ? (
                    qaItems.map((item, index) => (
                      <div key={item.id} className="rounded-lg border p-4 shadow-sm">
                        <h3 className="font-medium text-gray-900">{item.question}</h3>
                        <p className="mt-2 text-gray-600">{item.answer}</p>
                        {item.has_link && (
                          <a 
                            href={item.link_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
                          >
                            {item.link_text || "Saiba mais"}
                          </a>
                        )}
                        {item.has_image && item.image_url && (
                          <img 
                            src={item.image_url} 
                            alt="Imagem explicativa" 
                            className="mt-3 rounded-md max-w-full"
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">
                      Não há perguntas frequentes disponíveis para este serviço.
                    </p>
                  )}
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-gray-600">
                    Ainda precisa de ajuda? Fale com um de nossos atendentes.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={goBack} 
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <Button 
                      onClick={startChat} 
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                      disabled={checkingAgents}
                    >
                      {checkingAgents ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <MessageSquare className="mr-2 h-4 w-4" />
                      )}
                      Falar com Atendente
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
