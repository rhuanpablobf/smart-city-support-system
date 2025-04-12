
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

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
        console.log("Tempo limite de carregamento atingido na página Index");
        setHasTimeout(true);
        toast({
          title: "Erro de carregamento",
          description: "Não foi possível verificar o status de autenticação. Redirecionando para login.",
          variant: "destructive",
        });
        navigate('/login', { replace: true });
      }, 5000); // Reduzido para 5 segundos
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading, toast, navigate]);
  
  useEffect(() => {
    // Só redireciona quando o loading terminar para evitar redirecionamentos incorretos
    if (!loading && !hasTimeout) {
      console.log("Página Index - isAuthenticated:", isAuthenticated, "userRole:", userRole);
      
      if (isAuthenticated && userRole) {
        // Redireciona para o dashboard apropriado baseado no papel do usuário
        if (userRole === 'admin' || userRole === 'manager') {
          console.log("Redirecionando para /dashboard");
          navigate('/dashboard', { replace: true });
        } else {
          console.log("Redirecionando para /agent");
          navigate('/agent', { replace: true });
        }
      } else {
        console.log("Usuário não autenticado, redirecionando para /login");
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate, userRole, hasTimeout]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-chatbot-primary animate-spin" />
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
    </div>
  );
};

export default Index;
