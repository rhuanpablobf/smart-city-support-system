
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, hasPermission } = useAuth();
  const location = useLocation();
  
  if (loading) {
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

  if (!isAuthenticated) {
    // Redirecionar para login se o usuário não estiver autenticado
    console.log("User not authenticated, redirecting to login");
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
