
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow text-center">
        <div className="text-8xl font-bold text-chatbot-primary mb-4">404</div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Página Não Encontrada</h1>
        <p className="text-gray-600 mb-6">
          A página que você está procurando não existe ou foi removida.
        </p>
        
        <Button
          onClick={() => navigate('/')}
          className="w-full bg-chatbot-primary hover:bg-chatbot-dark"
        >
          Voltar para a página inicial
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
