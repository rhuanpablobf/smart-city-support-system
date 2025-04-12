
import React from 'react';
import { User } from '@/types';
import { UserTableItem } from './UserTableItem';

interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onEditUser,
  onDeleteUser
}) => {
  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-6 bg-gray-100 p-2 text-sm font-medium text-gray-500">
        <div className="col-span-2">Usuário</div>
        <div>Função</div>
        <div>Departamento</div>
        <div>Status</div>
        <div className="text-right">Ações</div>
      </div>
      
      <div className="divide-y">
        {users.map((user) => (
          <UserTableItem 
            key={user.id}
            user={user}
            onEditUser={onEditUser}
            onDeleteUser={onDeleteUser}
          />
        ))}
        
        {users.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            Nenhum usuário encontrado.
          </div>
        )}
      </div>
    </div>
  );
};
