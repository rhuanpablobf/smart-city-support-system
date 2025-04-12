
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useMutation } from '@tanstack/react-query';

export interface InactivityConfig {
  firstWarningTime: number;
  secondWarningTime: number;
  closeTime: number;
  firstWarningMessage: string;
  secondWarningMessage: string;
  closingMessage: string;
}

export interface ChatbotConfig {
  welcomeMessage: string;
  transferMessage: string;
  inactivityConfig: InactivityConfig;
}

export function useChatbotConfig() {
  const { toast } = useToast();
  
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Olá! Bem-vindo ao atendimento da Prefeitura. Por favor, informe seu CPF para iniciarmos o atendimento."
  );
  
  const [transferMessage, setTransferMessage] = useState(
    "Transferindo para um atendente especializado. Por favor, aguarde um momento..."
  );
  
  const [inactivityConfig, setInactivityConfig] = useState<InactivityConfig>({
    firstWarningTime: 1,
    secondWarningTime: 2,
    closeTime: 3,
    firstWarningMessage: "Você está online? Estamos aguardando sua resposta.",
    secondWarningMessage: "Ainda está aí? Se não responder, o atendimento será encerrado em breve.",
    closingMessage: "Atendimento encerrado por inatividade. Caso precise, inicie uma nova conversa."
  });

  const handleInactivityChange = (field: string, value: any) => {
    setInactivityConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save bot config mutation
  const saveBotConfigMutation = useMutation({
    mutationFn: async (config: ChatbotConfig) => {
      // Aqui seria a chamada para salvar as configurações no banco de dados
      // Por enquanto, apenas simulando com um delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return config;
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As configurações do bot foram atualizadas com sucesso."
      });
    },
    onError: (error) => {
      console.error("Error saving bot config:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const handleSaveChanges = () => {
    saveBotConfigMutation.mutate({
      welcomeMessage,
      transferMessage,
      inactivityConfig
    });
  };

  return {
    welcomeMessage,
    setWelcomeMessage,
    transferMessage,
    setTransferMessage,
    inactivityConfig,
    handleInactivityChange,
    handleSaveChanges,
    isSaving: saveBotConfigMutation.isPending
  };
}
