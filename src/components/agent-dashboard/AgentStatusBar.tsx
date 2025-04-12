
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';

interface AgentStatusBarProps {
  agentStatus: 'online' | 'offline' | 'break';
  updateAgentStatus: (value: string) => void;
}

const AgentStatusBar: React.FC<AgentStatusBarProps> = ({ agentStatus, updateAgentStatus }) => {
  return (
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
  );
};

export default AgentStatusBar;
