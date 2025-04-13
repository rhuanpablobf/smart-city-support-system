
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, hasPermission, logout, currentUser } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  // Add safety timeout to prevent infinite loading
  useEffect(() => {
    // Clear any existing timeout when the loading state changes
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    
    if (loading && !loadingTimeout) {
      const id = setTimeout(() => {
        console.log("Tempo limite de carregamento atingido, forçando navegação para login");
        setLoadingTimeout(true);
        // Show error message to the user
        toast({
          title: "Erro de autenticação",
          description: "O processo de verificação de permissões demorou muito tempo. Por favor, faça login novamente.",
          variant: "destructive",
        });
        // Force logout to reset the authentication state
        logout().catch(console.error);
      }, 8000); // 8 segundos
      
      setTimeoutId(id);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading, toast, logout, loadingTimeout]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  console.log("ProtectedRoute - loading:", loading, "isAuthenticated:", isAuthenticated, "loadingTimeout:", loadingTimeout);
  
  if (loading && !loadingTimeout) {
    // Mostrar um spinner de carregamento enquanto verifica a autenticação
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-10 w-10 text-chatbot-primary animate-spin mb-4" />
        <p className="text-gray-600 text-center">Verificando permissões...</p>
        <p className="text-sm text-gray-500 text-center mt-2">
          Isso pode levar alguns segundos...
        </p>
      </div>
    );
  }

  if (loadingTimeout || !isAuthenticated) {
    // Redirecionar para login se o usuário não estiver autenticado ou timeout ocorrer
    console.log("Usuário não autenticado ou tempo limite ocorreu, redirecionando para login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasPermission(requiredRole)) {
    // Redirecionar para página não autorizada se o usuário não tiver a função necessária
    console.log("Usuário não possui o papel necessário:", requiredRole, "papel atual:", currentUser?.role);
    return <Navigate to="/unauthorized" replace />;
  }

  // Usuário está autenticado e tem a função necessária
  console.log("Usuário está autenticado com as permissões necessárias");
  return <>{children}</>;
};

export default ProtectedRoute;
