
import React from 'react';
import { Loader2 } from 'lucide-react';

interface WaitingStateProps {
  waitingPosition: number;
  conversation: any;
}

const WaitingState: React.FC<WaitingStateProps> = ({ waitingPosition, conversation }) => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-chatbot-primary" />
          <h2 className="text-xl font-medium text-gray-900">Aguardando atendimento</h2>
          <p className="text-gray-500 mt-2">Você será atendido por um agente em breve.</p>
          
          {waitingPosition > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="font-medium text-blue-800">
                Sua posição na fila: {waitingPosition}º
              </p>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-md text-left">
            <h3 className="font-medium mb-1">Detalhes do atendimento:</h3>
            <p className="text-sm text-gray-600">Departamento: {conversation?.departments?.name}</p>
            <p className="text-sm text-gray-600">Serviço: {conversation?.services?.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingState;
