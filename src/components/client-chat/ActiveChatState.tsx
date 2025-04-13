
import React from 'react';
import { MessageCircle } from 'lucide-react';

interface ActiveChatStateProps {
  conversation: any;
}

const ActiveChatState: React.FC<ActiveChatStateProps> = ({ conversation }) => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <h2 className="text-xl font-medium text-gray-900">Atendimento iniciado!</h2>
          <p className="text-gray-500 mt-2">Um agente está atendendo você agora.</p>
          
          {/* Interface de chat aqui - placeholder para uma futura implementação */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md h-64 flex items-center justify-center">
            <p className="text-gray-500">Interface de chat em desenvolvimento</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveChatState;
