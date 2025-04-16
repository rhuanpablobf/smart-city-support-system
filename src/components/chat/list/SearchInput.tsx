
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw } from 'lucide-react';

export interface SearchInputProps {
  searchTerm: string;
  onSearchChange: React.Dispatch<React.SetStateAction<string>>;
  onNewChat: () => void;
  onRefresh?: () => Promise<void>;
}

const SearchInput = ({ 
  searchTerm, 
  onSearchChange, 
  onNewChat,
  onRefresh 
}: SearchInputProps) => {
  return (
    <div className="p-3 border-b flex gap-2 items-center">
      <Input
        type="text"
        placeholder="Buscar conversa..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1"
      />
      
      {onRefresh && (
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          title="Atualizar conversas"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
      
      <Button
        variant="default"
        size="sm"
        onClick={onNewChat}
        className="whitespace-nowrap"
      >
        <PlusCircle className="h-4 w-4 mr-1" />
        Nova
      </Button>
    </div>
  );
};

export default SearchInput;
