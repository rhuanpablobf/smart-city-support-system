
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const useChatSelection = () => {
  const { toast } = useToast();

  const startNewChat = useCallback(() => {
    // In a real application, this would create a new conversation in the database
    toast({
      title: "Nova conversa",
      description: "Funcionalidade não implementada nesta demonstração",
    });
  }, [toast]);

  const transferChat = useCallback((agentId: string) => {
    toast({
      title: "Transferência iniciada",
      description: "Funcionalidade não totalmente implementada nesta demonstração",
    });
  }, [toast]);

  return {
    startNewChat,
    transferChat,
  };
};
