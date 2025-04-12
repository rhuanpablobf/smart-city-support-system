
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, MoreHorizontal, Plus, Search, Trash2, UserPlus } from 'lucide-react';
import { User } from '@/types';
import { useUserManagement, UserFormValues } from '@/hooks/useUserManagement';
import { UserFormDialog } from '@/components/users/UserFormDialog';
import { DeleteUserDialog } from '@/components/users/DeleteUserDialog';

// Mock user data
const mockUsers = [
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
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'agent':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
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
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por nome, e-mail ou departamento..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={handleOpenAddUser}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
          
          <div className="rounded-md border">
            <div className="grid grid-cols-6 bg-gray-100 p-2 text-sm font-medium text-gray-500">
              <div className="col-span-2">Usuário</div>
              <div>Função</div>
              <div>Departamento</div>
              <div>Status</div>
              <div className="text-right">Ações</div>
            </div>
            
            <div className="divide-y">
              {filteredUsers.map((user) => (
                <div key={user.id} className="grid grid-cols-6 items-center p-2">
                  <div className="col-span-2 flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div>
                    <Badge 
                      variant="outline" 
                      className={getRoleBadgeColor(user.role)}
                    >
                      {user.role === 'admin' ? 'Administrador' : 
                       user.role === 'manager' ? 'Gerente' : 'Atendente'}
                    </Badge>
                  </div>
                  <div>
                    {user.department}
                  </div>
                  <div>
                    <Badge 
                      variant="outline" 
                      className={getStatusBadgeColor(user.status)}
                    >
                      {user.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDeleteDialog(user)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  Nenhum usuário encontrado.
                </div>
              )}
            </div>
          </div>
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
