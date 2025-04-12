
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { User } from '@/types';
import { useUserManagement, UserFormValues } from '@/hooks/useUserManagement';
import { UserFormDialog } from '@/components/users/UserFormDialog';
import { DeleteUserDialog } from '@/components/users/DeleteUserDialog';
import { UserTableHeader } from '@/components/users/UserTableHeader';
import { UserTable } from '@/components/users/UserTable';

// Mock user data with correct typing for User interface
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    department: 'TI',
    status: 'active'
  },
  {
    id: '2',
    name: 'Manager User',
    email: 'manager@example.com',
    role: 'manager',
    department: 'Saúde',
    status: 'active'
  },
  {
    id: '3',
    name: 'Agent User',
    email: 'agent@example.com',
    role: 'agent',
    department: 'Educação',
    status: 'active'
  },
  {
    id: '4',
    name: 'Carlos Santos',
    email: 'carlos@example.com',
    role: 'agent',
    department: 'Saúde',
    status: 'active'
  },
  {
    id: '5',
    name: 'Mariana Silva',
    email: 'mariana@example.com',
    role: 'manager',
    department: 'Finanças',
    status: 'inactive'
  }
];

const UsersManagement = () => {
  const {
    filteredUsers,
    searchTerm,
    setSearchTerm,
    addUser,
    updateUser,
    deleteUser
  } = useUserManagement(mockUsers);
  
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const handleOpenAddUser = () => {
    setSelectedUser(null);
    setIsUserFormOpen(true);
  };
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUserFormOpen(true);
  };
  
  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };
  
  const handleSaveUser = (formData: UserFormValues) => {
    if (selectedUser) {
      updateUser(selectedUser.id, formData);
    } else {
      addUser(formData);
    }
  };
  
  const handleDeleteConfirm = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h2>
        <Button onClick={handleOpenAddUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>
            Gerencie os usuários do sistema e suas permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserTableHeader 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddUser={handleOpenAddUser}
          />
          
          <UserTable 
            users={filteredUsers}
            onEditUser={handleEditUser}
            onDeleteUser={handleOpenDeleteDialog}
          />
        </CardContent>
      </Card>
      
      {/* Dialog para adicionar/editar usuário */}
      <UserFormDialog
        open={isUserFormOpen}
        onOpenChange={setIsUserFormOpen}
        user={selectedUser}
        onSave={handleSaveUser}
      />
      
      {/* Dialog para confirmar exclusão */}
      {selectedUser && (
        <DeleteUserDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          userName={selectedUser.name}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default UsersManagement;
