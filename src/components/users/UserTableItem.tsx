
import React from 'react';
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
import { Button } from '@/components/ui/button';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { User } from '@/types';

interface UserTableItemProps {
  user: User;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

export const UserTableItem: React.FC<UserTableItemProps> = ({
  user,
  onEditUser,
  onDeleteUser
}) => {
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

  return (
    <div className="grid grid-cols-6 items-center p-2">
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
            <DropdownMenuItem onClick={() => onEditUser(user)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteUser(user)}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Excluir</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
