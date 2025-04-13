
import React from 'react';
import { ChatProvider } from '@/contexts/chat';
import StatsCards from '@/components/agent-dashboard/StatsCards';
import AgentStatusBar from '@/components/agent-dashboard/AgentStatusBar';
import ChatContainer from '@/components/agent-dashboard/ChatContainer';
import { useAgentDashboard } from '@/hooks/useAgentDashboard';
import { useToast } from '@/components/ui/use-toast';
import { LoaderCircle } from 'lucide-react';

const AgentDashboard = () => {
  const { agentStatus, stats, loading, updateAgentStatus } = useAgentDashboard();
  const { toast } = useToast();
  
  return (
    <ChatProvider>
      <div className="h-full flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-24 mb-4">
            <LoaderCircle className="h-8 w-8 text-primary animate-spin" />
            <span className="ml-2">Carregando estatísticas...</span>
          </div>
        ) : (
          <div className="mb-4">
            <StatsCards stats={stats} />
          </div>
        )}
        
        <AgentStatusBar 
          agentStatus={agentStatus} 
          updateAgentStatus={updateAgentStatus} 
        />
        
        <ChatContainer 
          activeChats={stats.myActiveChats} 
          waitingChats={stats.waitingChats} 
        />
      </div>
    </ChatProvider>
  );
};

export default AgentDashboard;
