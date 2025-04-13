
import React from 'react';
import { CircleHelp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message: string;
  buttonText: string;
  onClick: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, buttonText, onClick }) => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="text-center">
        <CircleHelp className="h-16 w-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-medium text-gray-900">{message}</h2>
        <p className="text-gray-500 mt-2">Não foi possível encontrar os detalhes desta conversa</p>
        <Button className="mt-4" onClick={onClick}>
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default ErrorState;
