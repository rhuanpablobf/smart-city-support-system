
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SecurityTab: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const { toast } = useToast();

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
      
      // Clear password fields
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
      
      // Redirect to login page
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
    </div>
  );
};

export default SecurityTab;
