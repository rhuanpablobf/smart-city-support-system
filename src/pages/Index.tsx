
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated, loading, userRole } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading) {
      console.log("Index page - isAuthenticated:", isAuthenticated, "userRole:", userRole);
      
      if (isAuthenticated) {
        // Redirect to appropriate dashboard based on role
        if (userRole === 'admin' || userRole === 'manager') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/agent', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate, userRole]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-10 h-10 border-4 border-chatbot-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">Carregando...</p>
      {loading && (
        <p className="mt-2 text-sm text-gray-500">Verificando autenticação...</p>
      )}
    </div>
  );
};

export default Index;
