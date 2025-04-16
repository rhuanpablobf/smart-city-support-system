import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { User } from '@/types';
import { useUserManagement } from '@/hooks/useUserManagement';
import { UserFormDialog } from '@/components/users/UserFormDialog';
import { DeleteUserDialog } from '@/components/users/DeleteUserDialog';
import { UserTableHeader } from '@/components/users/UserTableHeader';
import { UserTable } from '@/components/users/UserTable';
import { useAuth } from '@/contexts/auth';
import { useToast } from "@/components/ui/use-toast";
import { useUserCrud } from '@/hooks/user/useUserCrud';
import { useUserFilter } from '@/hooks/user/useUserFilter';

const UsersManagement = () => {
  const {
    users,
    departments,
    services,
    loading: loadingUsers,
    error,
    refreshUsers
  } = useUserManagement();
  
  const { addUser, updateUser, deleteUser } = useUserCrud(refreshUsers);
  const { filteredUsers, searchTerm, setSearchTerm } = useUserFilter(users);
  
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
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
  
  const handleSaveUser = async (formData: any) => {
    setLoading(true);
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, formData);
        toast({
          title: "Usuário atualizado",
          description: "O usuário foi atualizado com sucesso.",
        });
      } else {
        await addUser(formData);
        toast({
          title: "Usuário adicionado",
          description: "O novo usuário foi adicionado com sucesso.",
        });
      }
      
      // Only close the dialog after the operation is complete
      setIsUserFormOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar o usuário",
        variant: "destructive",
      });
      // Keep the dialog open on error so the user can fix the issue
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      setLoading(true);
      try {
        await deleteUser(selectedUser.id);
        setIsDeleteDialogOpen(false);
        toast({
          title: "Usuário removido",
          description: "O usuário foi removido com sucesso.",
        });
      } catch (error: any) {
        toast({
          title: "Erro",
          description: error.message || "Ocorreu um erro ao excluir o usuário",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
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
          
          {(loadingUsers || loading) ? (
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
