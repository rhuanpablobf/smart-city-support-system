
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = () => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-chatbot-primary" />
        <h2 className="text-xl font-medium text-gray-900">Carregando...</h2>
        <p className="text-gray-500 mt-2">Por favor, aguarde...</p>
      </div>
    </div>
  );
};

export default LoadingState;
