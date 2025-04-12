
import React from 'react';
import { ChatProvider } from '@/contexts/chat';
import StatsCards from '@/components/agent-dashboard/StatsCards';
import AgentStatusBar from '@/components/agent-dashboard/AgentStatusBar';
import ChatContainer from '@/components/agent-dashboard/ChatContainer';
import { useAgentDashboard } from '@/hooks/useAgentDashboard';

const AgentDashboard = () => {
  const { agentStatus, stats, loading, updateAgentStatus } = useAgentDashboard();
  
  return (
    <ChatProvider>
      <div className="h-full flex flex-col">
        <div className="mb-4">
          <StatsCards stats={stats} />
        </div>
        
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
