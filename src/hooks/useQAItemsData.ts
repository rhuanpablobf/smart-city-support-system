
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QAItem } from '@/types';
import { useToast } from '@/components/ui/use-toast';

export const useQAItemsData = (serviceId: string) => {
  const [newQA, setNewQA] = useState<Partial<QAItem>>({
    service_id: serviceId,
    question: '',
    answer: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: qaItems = [], isLoading } = useQuery({
    queryKey: ['qa-items', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qa_items')
        .select('*')
        .eq('service_id', serviceId);
      
      if (error) {
        console.error("Error fetching QA items:", error);
        throw error;
      }
      
      return data.map(item => ({
        id: item.id,
        service_id: item.service_id,
        question: item.question,
        answer: item.answer,
        hasImage: item.has_image,
        imageUrl: item.image_url,
        hasLink: item.has_link,
        linkUrl: item.link_url,
        linkText: item.link_text
      }));
    },
  });

  // Add QA Item mutation
  const addQAMutation = useMutation({
    mutationFn: async (qaItem: Partial<QAItem>) => {
      const { data, error } = await supabase
        .from('qa_items')
        .insert({
          service_id: qaItem.service_id,
          question: qaItem.question,
          answer: qaItem.answer,
          has_image: qaItem.hasImage || false,
          image_url: qaItem.imageUrl || null,
          has_link: qaItem.hasLink || false,
          link_url: qaItem.linkUrl || null,
          link_text: qaItem.linkText || null
        })
        .select();

      if (error) {
        console.error("Error adding QA item:", error);
        throw error;
      }
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qa-items', serviceId] });
      toast({
        title: "Pergunta adicionada",
        description: "A pergunta e resposta foram adicionadas com sucesso."
      });
    },
    onError: (error) => {
      console.error("Error adding QA item:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a pergunta. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Update QA Item mutation
  const updateQAMutation = useMutation({
    mutationFn: async (qaItem: Partial<QAItem>) => {
      const { data, error } = await supabase
        .from('qa_items')
        .update({
          question: qaItem.question,
          answer: qaItem.answer,
          has_image: qaItem.hasImage || false,
          image_url: qaItem.imageUrl || null,
          has_link: qaItem.hasLink || false,
          link_url: qaItem.linkUrl || null,
          link_text: qaItem.linkText || null
        })
        .eq('id', qaItem.id)
        .select();

      if (error) {
        console.error("Error updating QA item:", error);
        throw error;
      }
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qa-items', serviceId] });
      toast({
        title: "Pergunta atualizada",
        description: "A pergunta e resposta foram atualizadas com sucesso."
      });
    },
    onError: (error) => {
      console.error("Error updating QA item:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a pergunta. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Delete QA Item mutation
  const deleteQAMutation = useMutation({
    mutationFn: async (qaId: string) => {
      const { error } = await supabase
        .from('qa_items')
        .delete()
        .eq('id', qaId);

      if (error) {
        console.error("Error deleting QA item:", error);
        throw error;
      }
      return qaId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qa-items', serviceId] });
      toast({
        title: "Pergunta removida",
        description: "A pergunta e resposta foram removidas com sucesso."
      });
    },
    onError: (error) => {
      console.error("Error deleting QA item:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a pergunta. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const handleSaveQA = () => {
    if (newQA.question && newQA.answer) {
      if (isEditing) {
        updateQAMutation.mutate(newQA);
      } else {
        addQAMutation.mutate(newQA);
      }
      
      resetForm();
    }
  };

  const handleDeleteQA = (qaId: string) => {
    deleteQAMutation.mutate(qaId);
  };

  const handleEditQA = (qa: QAItem) => {
    setNewQA({ ...qa });
    setIsEditing(true);
  };

  const handleChangeQA = (field: string, value: any) => {
    setNewQA({ ...newQA, [field]: value });
  };

  const resetForm = () => {
    setNewQA({
      service_id: serviceId,
      question: '',
      answer: '',
      hasImage: false,
      hasLink: false,
    });
    setIsEditing(false);
  };

  return {
    qaItems,
    isLoading,
    newQA,
    isEditing,
    handleSaveQA,
    handleDeleteQA,
    handleEditQA,
    handleChangeQA,
    resetForm
  };
};
