
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const from = location.state?.from?.pathname || '/';

  // Effect to handle redirection when already authenticated
  useEffect(() => {
    console.log("Login page - isAuthenticated check:", isAuthenticated, "userRole:", userRole, "authLoading:", authLoading);
    
    if (isAuthenticated && userRole && !authLoading) {
      // Redirecionar baseado no papel do usuário
      let redirectPath = '/';
      
      if (userRole === 'admin') {
        redirectPath = '/users';
      } else if (userRole === 'manager') {
        redirectPath = '/dashboard';
      } else if (userRole === 'agent') {
        redirectPath = '/agent';
      }
      
      console.log(`Usuário autenticado como ${userRole}, redirecionando para: ${redirectPath}`);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, userRole, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Email e senha são necessários para login.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Iniciando processo de login para:", email);
      await login(email, password);
      console.log("Login processado com sucesso");
      // Navigation will be handled by the useEffect hook that watches isAuthenticated
    } catch (error: any) {
      console.error('Login falhou:', error);
      // O toast de erro já está sendo mostrado no método login
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithDemoAccount = async (demoType: 'admin' | 'manager' | 'agent') => {
    setIsLoading(true);
    const demoEmail = `${demoType}@example.com`;
    const demoPassword = 'password123';
    
    try {
      console.log(`Tentando login de demonstração como ${demoType}`);
      await login(demoEmail, demoPassword);
      console.log("Login de demonstração processado", demoType);
      // Navigation will be handled by the useEffect hook
    } catch (error: any) {
      console.error(`Login de demonstração falhou para ${demoType}:`, error);
      // O toast de erro já está sendo mostrado no método login
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-chatbot-primary">SmartChat</h1>
          <p className="text-gray-600 mt-2">Sistema de Autoatendimento</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || authLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || authLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button 
                type="submit" 
                className="w-full bg-chatbot-primary hover:bg-chatbot-dark" 
                disabled={isLoading || authLoading}
              >
                {isLoading || authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : 'Entrar'}
              </Button>
              
              <div className="mt-6 w-full">
                <p className="text-sm text-gray-500 mb-3 text-center">Para demonstração, use:</p>
                <div className="grid gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => loginWithDemoAccount('admin')}
                    disabled={isLoading || authLoading}
                    className="w-full"
                  >
                    Entrar como Admin
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => loginWithDemoAccount('manager')}
                    disabled={isLoading || authLoading}
                    className="w-full"
                  >
                    Entrar como Gerente
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => loginWithDemoAccount('agent')}
                    disabled={isLoading || authLoading}
                    className="w-full"
                  >
                    Entrar como Atendente
                  </Button>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
