
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDepartmentsAndServices } from '@/hooks/useDepartmentsAndServices';
import { useCpfFormatter } from '@/hooks/useCpfFormatter';
import { useConversationStarter } from '@/hooks/useConversationStarter';
import ChatContainer from '@/components/client-chat/ChatContainer';
import CpfInput from '@/components/client-chat/CpfInput';
import DepartmentSelector from '@/components/client-chat/DepartmentSelector';
import ServiceSelector from '@/components/client-chat/ServiceSelector';
import StartChatButton from '@/components/client-chat/StartChatButton';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MessageCircle } from 'lucide-react';
import { realtimeService } from '@/services/realtime/realtimeService';
import { useToast } from '@/components/ui/use-toast';

const ClientChat = () => {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversation');
  const waitingParam = searchParams.get('waiting');
  const isWaiting = waitingParam === 'true';
  const [conversation, setConversation] = useState<any>(null);
  const [waitingPosition, setWaitingPosition] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [channelIds, setChannelIds] = useState<string[]>([]);
  const { toast } = useToast();

  // Hooks customizados para o formulário inicial
  const {
    departments,
    services,
    selectedDepartment,
    setSelectedDepartment,
    selectedService,
    setSelectedService
  } = useDepartmentsAndServices();

  const {
    cpf,
    handleCPFChange,
    isValidCPF
  } = useCpfFormatter();

  const {
    loading: startLoading,
    startConversation
  } = useConversationStarter({
    selectedDepartment,
    selectedService,
    cpf,
    isValidCPF
  });

  // Carregar detalhes da conversa se já temos um ID
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

        // Se estiver em espera, calcular posição na fila
        if (data.status === 'waiting') {
          calculateWaitingPosition(conversationId);
        }
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
      const ids = realtimeService.subscribeToTable('conversations', 'UPDATE', async (payload) => {
        if (payload.new && payload.new.id === conversationId) {
          // Se o status mudou para 'active', recarregar a página para mostrar o chat
          if (payload.new.status === 'active' && payload.old.status === 'waiting') {
            window.location.reload();
          } else {
            setConversation(payload.new);
          }
        }
      });
      
      setChannelIds(ids);
    }

    return () => {
      if (channelIds.length > 0) {
        realtimeService.unsubscribeAll(channelIds);
      }
    };
  }, [conversationId, toast]);

  // Calcular posição na fila
  const calculateWaitingPosition = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, created_at')
        .eq('status', 'waiting')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Encontrar a posição na fila
      const position = data.findIndex(c => c.id === convId) + 1;
      setWaitingPosition(position);
    } catch (error) {
      console.error("Erro ao calcular posição na fila:", error);
    }
  };

  // Mostrar tela de carregamento
  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-chatbot-primary" />
          <h2 className="text-xl font-medium text-gray-900">Carregando...</h2>
          <p className="text-gray-500 mt-2">Por favor, aguarde...</p>
        </div>
      </div>
    );
  }

  // Mostrar tela de espera se estamos em espera
  if (conversation && conversation.status === 'waiting') {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-chatbot-primary" />
            <h2 className="text-xl font-medium text-gray-900">Aguardando atendimento</h2>
            <p className="text-gray-500 mt-2">Você será atendido por um agente em breve.</p>
            
            {waitingPosition > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="font-medium text-blue-800">
                  Sua posição na fila: {waitingPosition}º
                </p>
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 rounded-md text-left">
              <h3 className="font-medium mb-1">Detalhes do atendimento:</h3>
              <p className="text-sm text-gray-600">Departamento: {conversation.departments?.name}</p>
              <p className="text-sm text-gray-600">Serviço: {conversation.services?.name}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar tela de chatbot ativo se estamos em atendimento
  if (conversation && conversation.status === 'active') {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h2 className="text-xl font-medium text-gray-900">Atendimento iniciado!</h2>
            <p className="text-gray-500 mt-2">Um agente está atendendo você agora.</p>
            
            {/* Interface de chat aqui - placeholder para uma futura implementação */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md h-64 flex items-center justify-center">
              <p className="text-gray-500">Interface de chat em desenvolvimento</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulário inicial para iniciar uma conversa
  return (
    <ChatContainer>
      <CpfInput 
        cpf={cpf}
        onChange={handleCPFChange}
      />
      
      <DepartmentSelector 
        departments={departments}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
      />
      
      <ServiceSelector 
        services={services}
        selectedService={selectedService}
        onServiceChange={setSelectedService}
        selectedDepartment={selectedDepartment}
      />
      
      <StartChatButton 
        loading={startLoading}
        disabled={!selectedDepartment || !selectedService || !cpf}
        onClick={startConversation}
      />
    </ChatContainer>
  );
};

export default ClientChat;
