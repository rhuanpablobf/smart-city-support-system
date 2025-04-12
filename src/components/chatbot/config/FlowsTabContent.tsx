
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FlowsTabContentProps {
  welcomeMessage: string;
  setWelcomeMessage: (message: string) => void;
  transferMessage: string;
  setTransferMessage: (message: string) => void;
}

const FlowsTabContent: React.FC<FlowsTabContentProps> = ({
  welcomeMessage,
  setWelcomeMessage,
  transferMessage,
  setTransferMessage,
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Autoatendimento</CardTitle>
          <CardDescription>
            Configure o fluxo de mensagens para o atendimento automatizado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="welcome-message">Mensagem de Boas-vindas</Label>
            <Input
              id="welcome-message"
              placeholder="Olá! Bem-vindo ao atendimento automático da Prefeitura..."
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="transfer-message">Mensagem de Transferência para Atendente</Label>
            <Input
              id="transfer-message"
              value={transferMessage}
              onChange={(e) => setTransferMessage(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Esta mensagem é exibida quando o bot transfere a conversa para um atendente humano.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Editor Visual</CardTitle>
          <CardDescription>
            Arraste e solte elementos para criar o fluxo de conversa do bot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 border rounded-lg bg-gray-50 flex items-center justify-center">
            <p className="text-gray-500">O editor visual será implementado aqui</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlowsTabContent;
