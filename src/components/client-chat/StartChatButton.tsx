
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare } from 'lucide-react';

interface StartChatButtonProps {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

const StartChatButton: React.FC<StartChatButtonProps> = ({
  loading,
  disabled,
  onClick
}) => {
  return (
    <div className="relative">
      <Button
        disabled={loading || disabled}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-5 py-3 w-full disabled:bg-gray-400"
        onClick={onClick}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Iniciando...
          </>
        ) : (
          <>
            <MessageSquare className="mr-2 h-4 w-4" />
            Iniciar Conversa
          </>
        )}
      </Button>
    </div>
  );
};

export default StartChatButton;
