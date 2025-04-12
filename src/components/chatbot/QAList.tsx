
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Image, Link as LinkIcon, Trash2, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { QAItem } from '@/types';

type QAListProps = {
  serviceId: string;
};

export const QAList = ({ serviceId }: QAListProps) => {
  const [newQA, setNewQA] = useState<Partial<QAItem>>({
    serviceId,
    question: '',
    answer: '',
  });
  const [openDialog, setOpenDialog] = useState(false);
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
        serviceId: item.service_id,
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
          service_id: qaItem.serviceId,
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
      
      setNewQA({
        serviceId,
        question: '',
        answer: '',
        hasImage: false,
        hasLink: false,
      });
      setOpenDialog(false);
      setIsEditing(false);
    }
  };

  const handleDeleteQA = (qaId: string) => {
    deleteQAMutation.mutate(qaId);
  };

  const handleEditQA = (qa: QAItem) => {
    setNewQA({ ...qa });
    setIsEditing(true);
    setOpenDialog(true);
  };

  if (isLoading) {
    return <div className="py-2 text-center text-sm">Carregando perguntas...</div>;
  }

  return (
    <div className="space-y-3 pl-4 border-l-2 ml-1 mt-2">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium">Perguntas e Respostas</h5>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="mr-1 h-3 w-3" />
              Nova Pergunta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar' : 'Adicionar'} Pergunta e Resposta</DialogTitle>
              <DialogDescription>
                Crie perguntas frequentes e suas respostas para este serviço.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qa-question">Pergunta</Label>
                <Input
                  id="qa-question"
                  value={newQA.question || ''}
                  onChange={(e) => setNewQA({ ...newQA, question: e.target.value })}
                  placeholder="Ex: Como agendar uma consulta?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qa-answer">Resposta</Label>
                <Textarea
                  id="qa-answer"
                  value={newQA.answer || ''}
                  onChange={(e) => setNewQA({ ...newQA, answer: e.target.value })}
                  placeholder="Descreva detalhadamente a resposta"
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant={newQA.hasImage ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setNewQA({ ...newQA, hasImage: !newQA.hasImage })}
                >
                  <Image className="mr-1 h-4 w-4" />
                  {newQA.hasImage ? 'Remover Imagem' : 'Adicionar Imagem'}
                </Button>
                <Button
                  type="button"
                  variant={newQA.hasLink ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setNewQA({ ...newQA, hasLink: !newQA.hasLink })}
                >
                  <LinkIcon className="mr-1 h-4 w-4" />
                  {newQA.hasLink ? 'Remover Link' : 'Adicionar Link'}
                </Button>
              </div>

              {newQA.hasImage && (
                <div className="space-y-2 border p-3 rounded-md">
                  <Label htmlFor="qa-image">URL da Imagem</Label>
                  <Input
                    id="qa-image"
                    value={newQA.imageUrl || ''}
                    onChange={(e) => setNewQA({ ...newQA, imageUrl: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole a URL da imagem ou faça upload para algum serviço de hospedagem de imagens.
                  </p>
                </div>
              )}

              {newQA.hasLink && (
                <div className="space-y-2 border p-3 rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor="qa-link-text">Texto do Link</Label>
                    <Input
                      id="qa-link-text"
                      value={newQA.linkText || ''}
                      onChange={(e) => setNewQA({ ...newQA, linkText: e.target.value })}
                      placeholder="Clique aqui para mais informações"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qa-link-url">URL do Link</Label>
                    <Input
                      id="qa-link-url"
                      value={newQA.linkUrl || ''}
                      onChange={(e) => setNewQA({ ...newQA, linkUrl: e.target.value })}
                      placeholder="https://exemplo.com/pagina"
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={handleSaveQA} disabled={!newQA.question || !newQA.answer}>
                {isEditing ? 'Atualizar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {qaItems.length === 0 ? (
          <div className="text-xs text-muted-foreground py-1">
            Nenhuma pergunta cadastrada para este serviço.
          </div>
        ) : (
          qaItems.map((qa) => (
            <Card key={qa.id} className="p-2 text-sm">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{qa.question}</p>
                  <p className="text-muted-foreground mt-1">{qa.answer}</p>
                  {qa.hasLink && qa.linkUrl && (
                    <a href={qa.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline block mt-1">
                      {qa.linkText || qa.linkUrl}
                    </a>
                  )}
                  {qa.hasImage && qa.imageUrl && (
                    <div className="mt-2">
                      <img src={qa.imageUrl} alt="Imagem de resposta" className="max-h-24 rounded-md" />
                    </div>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditQA(qa)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteQA(qa.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
