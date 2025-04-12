
import React, { useState } from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import ChatList from '@/components/chat/ChatList';
import ChatInterface from '@/components/chat/ChatInterface';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserCheck, Clock, Users } from 'lucide-react';

const AgentDashboard = () => {
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline' | 'break'>('online');
  
  const activeChats = 2;
  const waitingChats = 1;
  const maxChats = 5;
  
  return (
    <ChatProvider>
      <div className="h-full flex flex-col">
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Atendimentos Ativos</p>
              <p className="text-2xl font-bold">{activeChats} / {maxChats}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Em Espera</p>
              <p className="text-2xl font-bold">{waitingChats}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Seu Status</p>
                <div className="flex items-center">
                  <Badge 
                    variant="outline" 
                    className={`
                      ${agentStatus === 'online' ? 'bg-green-100 text-green-800 border-green-200' : 
                        agentStatus === 'break' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                        'bg-gray-100 text-gray-800 border-gray-200'}
                    `}
                  >
                    {agentStatus === 'online' ? 'Online' : 
                     agentStatus === 'break' ? 'Em Pausa' : 'Offline'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <Select
              value={agentStatus}
              onValueChange={(value: any) => setAgentStatus(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="break">Em Pausa</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ChatList />
          </div>
          
          <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden">
            <ChatInterface />
          </div>
        </div>
      </div>
    </ChatProvider>
  );
};

export default AgentDashboard;
