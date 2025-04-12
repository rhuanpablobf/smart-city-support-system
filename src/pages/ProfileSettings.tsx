
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';

const ProfileSettings = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const [name, setName] = useState(currentUser?.name || '');
  const [department, setDepartment] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Carrega as informações do departamento se o usuário tiver um
    if (currentUser?.department_id) {
      fetchDepartmentInfo(currentUser.department_id);
    } else {
      setDepartmentName("Departamento não definido");
    }
  }, [currentUser]);

  const fetchDepartmentInfo = async (departmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('name')
        .eq('id', departmentId)
        .single();

      if (error) throw error;
      
      if (data) {
        setDepartmentName(data.name);
      } else {
        setDepartmentName("Departamento não encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar departamento:", error);
      setDepartmentName("Erro ao carregar departamento");
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast({
        title: "Nome inválido",
        description: "Por favor, insira um nome válido.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('update_profile', {
        profile_id: currentUser?.id,
        profile_name: name,
        profile_email: currentUser?.email,
        profile_role: currentUser?.role,
        profile_department_id: currentUser?.department_id,
        profile_status: currentUser?.status
      });

      if (error) throw error;

      // Atualiza o usuário no contexto
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          name
        });
      }
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro ao atualizar seu perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Senhas diferentes",
        description: "A nova senha e a confirmação não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Senha alterada",
        description: "Sua senha foi atualizada com sucesso.",
      });
      
      // Limpar os campos de senha
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Ocorreu um erro ao alterar sua senha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogoutFromAllDevices = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      
      toast({
        title: "Logout de todos os dispositivos",
        description: "Você foi desconectado de todos os dispositivos.",
      });
      
      // Redirecionar para a página de login
      window.location.href = "/login";
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>

      <Tabs defaultValue="profile">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6 mt-6">
          <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold">Dados Pessoais</h3>
            <p className="text-sm text-gray-500">Atualize suas informações de perfil</p>
            
            <div className="flex flex-col items-center mb-6">
              <Avatar className="w-24 h-24 relative">
                <AvatarImage src={currentUser?.avatar || ''} alt={currentUser?.name || 'Avatar'} />
                <AvatarFallback className="text-3xl">{currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                <div className="absolute bottom-0 right-0 rounded-full bg-primary text-white p-1">
                  <Camera className="h-4 w-4" />
                </div>
              </Avatar>
              <p className="text-sm text-muted-foreground mt-2">Clique para alterar a foto</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={currentUser?.email || ''} 
                  disabled 
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="department">Departamento</Label>
                <Input 
                  id="department" 
                  value={departmentName} 
                  disabled 
                  className="mt-1 bg-gray-50"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={handleUpdateProfile} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6 mt-6">
          <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold">Preferências</h3>
            <p className="text-muted-foreground">Configure suas preferências de atendimento</p>
            
            {/* Preferências específicas do usuário podem ser adicionadas aqui */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="status">Status Padrão</Label>
                <select 
                  id="status"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="online">Online</option>
                  <option value="away">Ausente</option>
                  <option value="busy">Ocupado</option>
                </select>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6 mt-6">
          <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold">Alterar Senha</h3>
            <p className="text-muted-foreground">Atualize sua senha periodicamente para maior segurança</p>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input 
                  id="new-password" 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input 
                  id="confirm-password" 
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancelar</Button>
                <Button 
                  onClick={handleChangePassword} 
                  disabled={passwordLoading || !newPassword || !confirmNewPassword}
                >
                  {passwordLoading ? 'Atualizando...' : 'Atualizar Senha'}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold">Sessão</h3>
            <p className="text-muted-foreground">Gerencie sua sessão atual</p>
            
            <div>
              <Button 
                variant="destructive" 
                onClick={handleLogoutFromAllDevices}
                className="w-full sm:w-auto"
              >
                Sair de Todos os Dispositivos
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileSettings;
