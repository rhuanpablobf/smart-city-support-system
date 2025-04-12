
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Avatar } from './Avatar';
import { User } from '@/types';

interface ProfileTabProps {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ currentUser, setCurrentUser }) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [departmentName, setDepartmentName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load department information if user has one
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

      // Update user in context
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

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold">Dados Pessoais</h3>
      <p className="text-sm text-gray-500">Atualize suas informações de perfil</p>
      
      <div className="flex flex-col items-center mb-6">
        <Avatar currentUser={currentUser} />
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
  );
};

export default ProfileTab;
