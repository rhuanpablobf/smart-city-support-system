
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { AgentDashboardStats } from '@/services/agent';

interface StatsCardsProps {
  stats: AgentDashboardStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
  );
};

export default StatsCards;
