
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface MobileSidebarToggleProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const MobileSidebarToggle: React.FC<MobileSidebarToggleProps> = ({ 
  sidebarOpen, 
  setSidebarOpen 
}) => {
  return (
    <div className="lg:hidden fixed top-4 left-4 z-50">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
    </div>
  );
};

export default MobileSidebarToggle;
