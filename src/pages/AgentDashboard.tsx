
import React, { useEffect } from 'react';
import { ChatProvider } from '@/contexts/chat';
import StatsCards from '@/components/agent-dashboard/StatsCards';
import AgentStatusBar from '@/components/agent-dashboard/AgentStatusBar';
import ChatContainer from '@/components/agent-dashboard/ChatContainer';
import { useAgentDashboard } from '@/hooks/useAgentDashboard';
import { useToast } from '@/components/ui/use-toast';
import { LoaderCircle } from 'lucide-react';

const AgentDashboard = () => {
  const { agentStatus, stats, loading, updateAgentStatus, refreshStats } = useAgentDashboard();
  const { toast } = useToast();
  
  // Refresh stats on initial load
  useEffect(() => {
    refreshStats().catch((error) => {
      console.error("Error refreshing stats:", error);
      toast({
        title: "Erro ao carregar estatísticas",
        description: "Não foi possível carregar as estatísticas. Por favor, tente novamente.",
        variant: "destructive"
      });
    });
    
    // Set up automatic refresh every 60 seconds
    const interval = setInterval(() => {
      refreshStats().catch(console.error);
    }, 60000);
    
    return () => clearInterval(interval);
  }, [refreshStats, toast]);
  
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
