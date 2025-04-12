
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/components/ui/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, hasPermission, logout } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Add safety timeout to prevent infinite loading
  useEffect(() => {
    // Set a timeout to prevent being stuck in the loading state
    let timeoutId: NodeJS.Timeout;
    
    if (loading) {
      timeoutId = setTimeout(() => {
        console.log("Loading timeout reached, forcing navigation to login");
        setLoadingTimeout(true);
        // Show error message to the user
        toast({
          title: "Erro de autenticação",
          description: "O processo de verificação de permissões demorou muito tempo. Por favor, faça login novamente.",
          variant: "destructive",
        });
        // Force logout to reset the authentication state
        logout().catch(console.error);
      }, 10000); // 10 seconds timeout
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading, toast, logout]);

  console.log("ProtectedRoute - loading:", loading, "isAuthenticated:", isAuthenticated);
  
  if (loading && !loadingTimeout) {
    // Mostrar um spinner de carregamento enquanto verifica a autenticação
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-10 h-10 border-4 border-chatbot-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-center">Verificando permissões...</p>
        <p className="text-sm text-gray-500 text-center mt-2">
          Isso pode levar alguns segundos...
        </p>
      </div>
    );
  }

  if (loadingTimeout || !isAuthenticated) {
    // Redirecionar para login se o usuário não estiver autenticado ou timeout ocorrer
    console.log("User not authenticated or timeout occurred, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasPermission(requiredRole)) {
    // Redirecionar para página não autorizada se o usuário não tiver a função necessária
    console.log("User does not have required role:", requiredRole);
    return <Navigate to="/unauthorized" replace />;
  }

  // Usuário está autenticado e tem a função necessária
  console.log("User is authenticated with required permissions");
  return <>{children}</>;
};

export default ProtectedRoute;
