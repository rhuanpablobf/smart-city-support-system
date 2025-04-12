import React, { useState, useEffect } from 'react';
import { ChatProvider } from '@/contexts/chat';
import ChatList from '@/components/chat/ChatList';
import ChatInterface from '@/components/chat/ChatInterface';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UserCheck, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import { fetchAgentDashboardStats, AgentDashboardStats } from '@/services/agent';
import { useToast } from '@/components/ui/use-toast';

const AgentDashboard = () => {
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline' | 'break'>('online');
  const [stats, setStats] = useState<AgentDashboardStats>({
    activeChats: 0,
    maxChats: 5,
    waitingChats: 0,
    avgWaitTime: 0,
    completedChats: 0,
    completedChangePercent: 0,
    abandonedChats: 0,
    abandonedRate: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        const data = await fetchAgentDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Erro ao carregar estatísticas do painel:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as estatísticas do painel. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardStats();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadDashboardStats, 30000);
    
    return () => clearInterval(interval);
  }, [toast]);
  
  // Função para quando o agente atualiza seu status
  const updateAgentStatus = async (value: string) => {
    setAgentStatus(value as 'online' | 'offline' | 'break');
    // Implementar integração com o banco de dados para atualizar o status do agente
  };
  
  return (
    <ChatProvider>
      <div className="h-full flex flex-col">
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Atendimentos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-blue-100 p-2">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold">{stats.activeChats} / {stats.maxChats}</div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Capacidade atual de {stats.maxChats > 0 ? Math.round((stats.activeChats / stats.maxChats * 100)) : 0}%
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Em Espera</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-yellow-100 p-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold">{stats.waitingChats}</div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Tempo médio de espera: {stats.avgWaitTime} min
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Completados Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-green-100 p-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold">{stats.completedChats}</div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {stats.completedChangePercent >= 0 ? '+' : ''}{stats.completedChangePercent}% desde ontem
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Abandonados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-red-100 p-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-2xl font-bold">{stats.abandonedChats}</div>
              </div>
              <p className="mt-2 text-xs text-gray-500">Taxa: {stats.abandonedRate}%</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <h2 className="font-semibold">Seu Status:</h2>
            <Select
              value={agentStatus}
              onValueChange={updateAgentStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">
                  <div className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                    Online
                  </div>
                </SelectItem>
                <SelectItem value="break">
                  <div className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-yellow-500"></div>
                    Em Pausa
                  </div>
                </SelectItem>
                <SelectItem value="offline">
                  <div className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-gray-500"></div>
                    Offline
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" className="space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>Solicitar Ajuda</span>
            </Button>
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
          <Card className="overflow-hidden">
            <CardHeader className="py-3">
              <CardTitle className="text-base font-medium flex items-center justify-between">
                <span>Conversas</span>
                <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                  {stats.activeChats + stats.waitingChats}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              <div className="h-[500px]">
                <ChatList />
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2 overflow-hidden">
            <CardHeader className="py-3">
              <CardTitle className="text-base font-medium">Conversa Atual</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              <div className="h-[500px]">
                <ChatInterface />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ChatProvider>
  );
};

export default AgentDashboard;
