
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AgentTransferButtonProps {
  loading: boolean;
  onClick: () => void;
}

const AgentTransferButton: React.FC<AgentTransferButtonProps> = ({ loading, onClick }) => {
  return (
    <div className="text-center">
      <p className="text-gray-600 mb-4">Não encontrou o que procurava?</p>
      <Button 
        onClick={onClick} 
        className="bg-chatbot-primary hover:bg-chatbot-dark"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Transferindo...
          </>
        ) : (
          'Falar com Atendente'
        )}
      </Button>
    </div>
  );
};

export default AgentTransferButton;
