
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useWaitingPosition = (conversationId: string | null, isWaiting: boolean) => {
  const [waitingPosition, setWaitingPosition] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    if (!conversationId || !isWaiting) return;

    // Initial calculation of waiting position
    calculateWaitingPosition(conversationId);

    // Set up interval to update position regularly
    const interval = setInterval(() => {
      calculateWaitingPosition(conversationId);
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [conversationId, isWaiting]);

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
      toast({
        title: "Erro ao calcular posição na fila",
        description: "Não foi possível determinar sua posição na fila. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return { waitingPosition };
};
