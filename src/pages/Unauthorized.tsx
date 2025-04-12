
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useToast } from "@/components/ui/use-toast";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { currentUser, userRole, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // Log diagnósticos para ajudar a depurar
    console.log("Página não autorizada - Diagnóstico:", {
      isAuthenticated,
      userRole,
      currentUser
    });
    
    // Se não estiver autenticado, redirecionar para login
    if (!isAuthenticated) {
      console.log("Usuário não autenticado, redirecionando para login");
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, userRole, currentUser, navigate]);
  
  const handleGoHome = () => {
    // Navegar diretamente para a página de login em vez da página inicial
    // para evitar loops de redirecionamento
    navigate('/login', { replace: true });
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      navigate('/login', { replace: true });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar desconectar.",
        variant: "destructive",
      });
    }
  };
  
  const goToHomePage = () => {
    // Tentar navegar para a página apropriada baseada no papel
    if (userRole === 'admin') {
      navigate('/users', { replace: true });
    } else if (userRole === 'manager') {
      navigate('/dashboard', { replace: true });
    } else if (userRole === 'agent') {
      navigate('/agent', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
        <p className="text-gray-600 mb-6">
          Você não tem permissões suficientes para acessar esta página.
        </p>
        
        {currentUser && (
          <div className="mb-6 p-4 bg-gray-50 rounded text-left text-sm">
            <p><strong>Usuário:</strong> {currentUser.name}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Papel:</strong> {currentUser.role}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <Button
            onClick={handleGoHome}
            className="w-full bg-chatbot-primary hover:bg-chatbot-dark"
          >
            Voltar para a página de login
          </Button>
          
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
          >
            Sair / Deslogar
          </Button>
          
          {userRole === 'admin' && (
            <Button
              onClick={() => navigate('/users')}
              variant="outline"
              className="w-full"
            >
              Gerenciar Usuários
            </Button>
          )}
          
          {userRole === 'agent' && (
            <Button
              onClick={() => navigate('/agent')}
              variant="outline"
              className="w-full"
            >
              Ir para Atendimentos
            </Button>
          )}
          
          <Button
            onClick={goToHomePage}
            variant="outline"
            className="w-full"
          >
            Tentar página inicial correspondente ao seu papel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
