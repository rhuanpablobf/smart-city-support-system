
import { useState } from 'react';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Tipo para os valores do formulário de usuário
export interface UserFormValues {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'agent';
  departmentId?: string;
  serviceIds?: string[];
  status: 'active' | 'inactive';
}

export function useUserManagement(initialUsers: User[]) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Filtrar usuários com base no termo de pesquisa
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Adicionar novo usuário
  const addUser = (userData: UserFormValues) => {
    const newUser: User = {
      id: uuidv4(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      departmentId: userData.departmentId,
      serviceIds: userData.serviceIds,
      status: userData.status
    };
    
    setUsers(prevUsers => [...prevUsers, newUser]);
    
    toast({
      title: "Usuário adicionado",
      description: "O novo usuário foi adicionado com sucesso.",
    });
    
    return newUser;
  };

  // Editar usuário existente
  const updateUser = (userId: string, userData: UserFormValues) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, ...userData } 
          : user
      )
    );
    
    toast({
      title: "Usuário atualizado",
      description: "O usuário foi atualizado com sucesso.",
    });
  };

  // Excluir usuário
  const deleteUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    
    toast({
      title: "Usuário removido",
      description: "O usuário foi removido com sucesso.",
    });
  };

  return {
    users,
    filteredUsers,
    searchTerm,
    setSearchTerm,
    addUser,
    updateUser,
    deleteUser
  };
}
