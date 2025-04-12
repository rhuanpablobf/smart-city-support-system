
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

interface MainContentProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const MainContent: React.FC<MainContentProps> = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Painel de Atendimento"
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <main className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default MainContent;
