
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { isAuthenticated, loading, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasTimeout, setHasTimeout] = useState(false);
  
  // Add safety timeout to prevent infinite loading
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (loading) {
      timeoutId = setTimeout(() => {
        console.log("Loading timeout reached in Index page");
        setHasTimeout(true);
        toast({
          title: "Erro de carregamento",
          description: "Não foi possível verificar o status de autenticação. Redirecionando para login.",
          variant: "destructive",
        });
        navigate('/login', { replace: true });
      }, 8000); // 8 seconds timeout
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading, toast, navigate]);
  
  useEffect(() => {
    // Só redireciona quando o loading terminar para evitar redirecionamentos incorretos
    if (!loading && !hasTimeout) {
      console.log("Index page - isAuthenticated:", isAuthenticated, "userRole:", userRole);
      
      if (isAuthenticated) {
        // Redireciona para o dashboard apropriado baseado no papel do usuário
        if (userRole === 'admin' || userRole === 'manager') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/agent', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate, userRole, hasTimeout]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-10 h-10 border-4 border-chatbot-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">Carregando...</p>
      {loading && (
        <p className="mt-2 text-sm text-gray-500">Verificando autenticação...</p>
      )}
      {!loading && (
        <p className="mt-2 text-sm text-gray-500">Redirecionando...</p>
      )}
      {hasTimeout && (
        <p className="mt-2 text-sm text-red-500">Tempo limite excedido. Redirecionando para login...</p>
      )}
    </div>
  );
};

export default Index;
