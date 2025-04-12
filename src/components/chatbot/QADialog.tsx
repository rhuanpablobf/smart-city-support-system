
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Image, Link as LinkIcon } from 'lucide-react';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QAItem } from '@/types';

type QADialogProps = {
  qaItem: Partial<QAItem>;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  onChange: (field: string, value: any) => void;
};

export const QADialog = ({ 
  qaItem, 
  isEditing, 
  onSave, 
  onCancel,
  onChange 
}: QADialogProps) => {
  return (
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
            value={qaItem.question || ''}
            onChange={(e) => onChange('question', e.target.value)}
            placeholder="Ex: Como agendar uma consulta?"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="qa-answer">Resposta</Label>
          <Textarea
            id="qa-answer"
            value={qaItem.answer || ''}
            onChange={(e) => onChange('answer', e.target.value)}
            placeholder="Descreva detalhadamente a resposta"
            className="min-h-[100px]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant={qaItem.hasImage ? "secondary" : "outline"}
            size="sm"
            onClick={() => onChange('hasImage', !qaItem.hasImage)}
          >
            <Image className="mr-1 h-4 w-4" />
            {qaItem.hasImage ? 'Remover Imagem' : 'Adicionar Imagem'}
          </Button>
          <Button
            type="button"
            variant={qaItem.hasLink ? "secondary" : "outline"}
            size="sm"
            onClick={() => onChange('hasLink', !qaItem.hasLink)}
          >
            <LinkIcon className="mr-1 h-4 w-4" />
            {qaItem.hasLink ? 'Remover Link' : 'Adicionar Link'}
          </Button>
        </div>

        {qaItem.hasImage && (
          <div className="space-y-2 border p-3 rounded-md">
            <Label htmlFor="qa-image">URL da Imagem</Label>
            <Input
              id="qa-image"
              value={qaItem.imageUrl || ''}
              onChange={(e) => onChange('imageUrl', e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Cole a URL da imagem ou faça upload para algum serviço de hospedagem de imagens.
            </p>
          </div>
        )}

        {qaItem.hasLink && (
          <div className="space-y-2 border p-3 rounded-md">
            <div className="space-y-2">
              <Label htmlFor="qa-link-text">Texto do Link</Label>
              <Input
                id="qa-link-text"
                value={qaItem.linkText || ''}
                onChange={(e) => onChange('linkText', e.target.value)}
                placeholder="Clique aqui para mais informações"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qa-link-url">URL do Link</Label>
              <Input
                id="qa-link-url"
                value={qaItem.linkUrl || ''}
                onChange={(e) => onChange('linkUrl', e.target.value)}
                placeholder="https://exemplo.com/pagina"
              />
            </div>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSave} disabled={!qaItem.question || !qaItem.answer}>
          {isEditing ? 'Atualizar' : 'Adicionar'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
