
import React from 'react';
import { SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchButtonProps {
  onClick: () => void;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onClick }) => {
  return (
    <Button onClick={onClick} className="ml-auto">
      <SearchIcon className="h-4 w-4 mr-2" />
      Buscar
    </Button>
  );
};

export default SearchButton;
