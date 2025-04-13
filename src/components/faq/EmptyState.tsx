
import React from 'react';
import { CircleHelp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAgentTransfer: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAgentTransfer }) => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="text-center">
        <CircleHelp className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
        <h2 className="text-xl font-medium text-gray-900">Sem perguntas frequentes disponíveis</h2>
        <p className="text-gray-500 mt-2">Não encontramos perguntas frequentes para este serviço</p>
        <Button className="mt-4" onClick={onAgentTransfer}>
          Ir para o Atendimento
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;
