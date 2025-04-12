
import React from 'react';
import { Avatar as AvatarUI, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { User } from '@/types';

interface AvatarProps {
  currentUser: User | null;
}

export const Avatar: React.FC<AvatarProps> = ({ currentUser }) => {
  return (
    <>
      <AvatarUI className="w-24 h-24 relative">
        <AvatarImage src={currentUser?.avatar || ''} alt={currentUser?.name || 'Avatar'} />
        <AvatarFallback className="text-3xl">{currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
        <div className="absolute bottom-0 right-0 rounded-full bg-primary text-white p-1">
          <Camera className="h-4 w-4" />
        </div>
      </AvatarUI>
      <p className="text-sm text-muted-foreground mt-2">Clique para alterar a foto</p>
    </>
  );
};
