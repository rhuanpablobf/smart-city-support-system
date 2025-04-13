
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  BarChart, 
  Settings, 
  Users,
  PieChart,
  HelpCircle,
  LogOut,
  Building2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { currentUser, logout, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
    navigate('/login');
  };
  
  // Helper function to get role display name
  const getRoleDisplayName = (role: string | null) => {
    switch(role) {
      case 'master': return 'Master Admin';
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'agent': return 'Atendente';
      default: return 'Usuário';
    }
  };

  return (
    <>
      <div 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative w-72 h-full transition-transform duration-300 ease-in-out z-40 bg-white shadow-lg overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 border-b px-4">
            <h1 className="text-xl font-bold text-chatbot-primary">SmartChat</h1>
            <Badge 
              variant="outline" 
              className="bg-green-100 text-green-800 border-green-200"
            >
              {getRoleDisplayName(userRole)}
            </Badge>
          </div>
          
          <div className="px-4 py-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback>{currentUser ? getInitials(currentUser.name) : 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{currentUser?.name}</p>
                <p className="text-sm text-gray-500">{currentUser?.department?.name || 'Departamento não definido'}</p>
              </div>
            </div>
          </div>

          <Separator />
          
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {/* Master sees everything */}
            {userRole === 'master' && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/users')}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Usuários
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard')}
                >
                  <BarChart className="mr-2 h-5 w-5" />
                  Dashboard Geral
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/reports')}
                >
                  <PieChart className="mr-2 h-5 w-5" />
                  Relatórios Gerais
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/agent')}
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Atendimentos
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/secretary')}
                >
                  <Building2 className="mr-2 h-5 w-5" />
                  Secretarias
                </Button>
              </>
            )}

            {/* Secretary Admin can manage own departments and users */}
            {userRole === 'admin' && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/users')}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Usuários da Secretaria
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard')}
                >
                  <BarChart className="mr-2 h-5 w-5" />
                  Dashboard
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/chatbot')}
                >
                  <HelpCircle className="mr-2 h-5 w-5" />
                  Configurar Chatbot
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/reports')}
                >
                  <PieChart className="mr-2 h-5 w-5" />
                  Relatórios
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/agent')}
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Atendimentos
                </Button>
              </>
            )}

            {/* Manager can manage QA and agents in their department */}
            {userRole === 'manager' && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/agent')}
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Atendimentos
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard')}
                >
                  <BarChart className="mr-2 h-5 w-5" />
                  Dashboard Departamento
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/chatbot')}
                >
                  <HelpCircle className="mr-2 h-5 w-5" />
                  Configurar Chatbot
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/users')}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Atendentes
                </Button>
              </>
            )}

            {/* Agent can only see their own attendances and stats */}
            {userRole === 'agent' && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/agent')}
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Atendimentos
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard')}
                >
                  <BarChart className="mr-2 h-5 w-5" />
                  Minhas Estatísticas
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/settings')}
            >
              <Settings className="mr-2 h-5 w-5" />
              Configurações
            </Button>
          </nav>
          
          <div className="border-t p-4">
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
