
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

interface UserTableHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddUser: () => void;
}

export const UserTableHeader: React.FC<UserTableHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  onAddUser
}) => {
  return (
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
      <Button variant="outline" onClick={onAddUser}>
        <Plus className="mr-2 h-4 w-4" />
        Adicionar
      </Button>
    </div>
  );
};
