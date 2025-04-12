
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  // Effect to handle redirection when already authenticated
  useEffect(() => {
    console.log("Login check - isAuthenticated:", isAuthenticated);
    if (isAuthenticated) {
      console.log("User is authenticated, navigating to:", from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Attempting to login with:", email);
      await login(email, password);
      console.log("Login successful, should redirect soon");
      // Navigation will be handled by the useEffect hook that watches isAuthenticated
    } catch (error: any) {
      console.error('Login failed:', error);
      toast({
        title: "Falha no login",
        description: error?.message || "Credenciais inválidas. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithDemoAccount = async (demoType: 'admin' | 'manager' | 'agent') => {
    setIsLoading(true);
    const demoEmail = `${demoType}@example.com`;
    const demoPassword = 'password123';
    
    try {
      console.log(`Attempting demo login as ${demoType}`);
      await login(demoEmail, demoPassword);
      console.log("Demo login successful, should redirect soon");
      // Navigation will be handled by the useEffect hook
    } catch (error: any) {
      console.error(`Demo login failed for ${demoType}:`, error);
      toast({
        title: "Falha no login de demonstração",
        description: error?.message || `Não foi possível entrar como ${demoType}.`,
        variant: "destructive",
      });
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
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button 
                type="submit" 
                className="w-full bg-chatbot-primary hover:bg-chatbot-dark" 
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
              
              <div className="mt-6 w-full">
                <p className="text-sm text-gray-500 mb-3 text-center">Para demonstração, use:</p>
                <div className="grid gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => loginWithDemoAccount('admin')}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Entrar como Admin
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => loginWithDemoAccount('manager')}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Entrar como Gerente
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => loginWithDemoAccount('agent')}
                    disabled={isLoading}
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
