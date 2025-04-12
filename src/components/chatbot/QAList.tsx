
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useQAItemsData } from '@/hooks/useQAItemsData';
import { QADialog } from './QADialog';
import { QAItemComponent } from './QAItem';

type QAListProps = {
  serviceId: string;
};

export const QAList = ({ serviceId }: QAListProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  
  const {
    qaItems,
    isLoading,
    newQA,
    isEditing,
    handleSaveQA,
    handleDeleteQA,
    handleEditQA,
    handleChangeQA,
    resetForm
  } = useQAItemsData(serviceId);

  const handleSave = () => {
    handleSaveQA();
    setOpenDialog(false);
  };

  const handleCancel = () => {
    resetForm();
    setOpenDialog(false);
  };

  const handleOpenEditDialog = (qa: any) => {
    handleEditQA(qa);
    setOpenDialog(true);
  };

  if (isLoading) {
    return <div className="py-2 text-center text-sm">Carregando perguntas...</div>;
  }

  return (
    <div className="space-y-3 pl-4 border-l-2 ml-1 mt-2">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium">Perguntas e Respostas</h5>
        <Dialog open={openDialog} onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="mr-1 h-3 w-3" />
              Nova Pergunta
            </Button>
          </DialogTrigger>
          <QADialog 
            qaItem={newQA} 
            isEditing={isEditing}
            onSave={handleSave}
            onCancel={handleCancel}
            onChange={handleChangeQA}
          />
        </Dialog>
      </div>

      <div className="space-y-2">
        {qaItems.length === 0 ? (
          <div className="text-xs text-muted-foreground py-1">
            Nenhuma pergunta cadastrada para este serviço.
          </div>
        ) : (
          qaItems.map((qa) => (
            <QAItemComponent 
              key={qa.id} 
              qa={qa} 
              onEdit={handleOpenEditDialog} 
              onDelete={handleDeleteQA} 
            />
          ))
        )}
      </div>
    </div>
  );
};
