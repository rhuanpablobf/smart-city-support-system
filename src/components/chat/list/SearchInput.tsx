
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Search, RefreshCw } from 'lucide-react';

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewChat: () => void;
  onRefresh?: () => Promise<void>;
}

const SearchInput = ({ searchTerm, onSearchChange, onNewChat, onRefresh }: SearchInputProps) => {
  return (
    <div className="p-3 flex items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Buscar conversa..." 
          className="h-9 pl-9" 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button 
        onClick={onNewChat}
        variant="outline" 
        size="icon"
        className="h-9 w-9 flex-shrink-0"
      >
        <MessageSquarePlus className="h-4 w-4" />
      </Button>
      {onRefresh && (
        <Button 
          onClick={onRefresh}
          variant="outline" 
          size="icon"
          className="h-9 w-9 flex-shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SearchInput;
