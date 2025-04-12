
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
import { useAuth } from '@/contexts/auth';

const UsersManagement = () => {
  const {
    filteredUsers,
    departments,
    services,
    searchTerm,
    setSearchTerm,
    addUser,
    updateUser,
    deleteUser,
    loading
  } = useUserManagement();
  
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { currentUser } = useAuth();
  
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
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse text-center">
                <p className="text-muted-foreground">Carregando usuários...</p>
              </div>
            </div>
          ) : (
            <UserTable 
              users={filteredUsers}
              onEditUser={handleEditUser}
              onDeleteUser={handleOpenDeleteDialog}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Dialog para adicionar/editar usuário */}
      <UserFormDialog
        open={isUserFormOpen}
        onOpenChange={setIsUserFormOpen}
        user={selectedUser}
        onSave={handleSaveUser}
        departments={departments}
        services={services}
        currentUserRole={currentUser?.role}
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
