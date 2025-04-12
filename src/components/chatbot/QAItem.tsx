
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { QAItem as QAItemType } from '@/types';

type QAItemComponentProps = {
  qa: QAItemType;
  onEdit: (qa: QAItemType) => void;
  onDelete: (qaId: string) => void;
};

export const QAItemComponent = ({ qa, onEdit, onDelete }: QAItemComponentProps) => {
  return (
    <Card key={qa.id} className="p-2 text-sm">
      <div className="flex justify-between">
        <div>
          <p className="font-medium">{qa.question}</p>
          <p className="text-muted-foreground mt-1">{qa.answer}</p>
          {qa.hasLink && qa.linkUrl && (
            <a 
              href={qa.linkUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 hover:underline block mt-1"
            >
              {qa.linkText || qa.linkUrl}
            </a>
          )}
          {qa.hasImage && qa.imageUrl && (
            <div className="mt-2">
              <img 
                src={qa.imageUrl} 
                alt="Imagem de resposta" 
                className="max-h-24 rounded-md"
              />
            </div>
          )}
        </div>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(qa)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(qa.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
