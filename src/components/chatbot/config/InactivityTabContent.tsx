
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InactivityConfig {
  firstWarningTime: number;
  secondWarningTime: number;
  closeTime: number;
  firstWarningMessage: string;
  secondWarningMessage: string;
  closingMessage: string;
}

interface InactivityTabContentProps {
  inactivityConfig: InactivityConfig;
  onInactivityChange: (field: string, value: any) => void;
}

const InactivityTabContent: React.FC<InactivityTabContentProps> = ({
  inactivityConfig,
  onInactivityChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tempo de Inatividade e Respostas Automáticas</CardTitle>
        <CardDescription>
          Configure os intervalos e mensagens para usuários inativos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Intervalos de Tempo</h3>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="first-warning-time">Primeiro Aviso (minutos)</Label>
              <Input
                id="first-warning-time"
                type="number"
                value={inactivityConfig.firstWarningTime}
                onChange={(e) => onInactivityChange('firstWarningTime', parseInt(e.target.value, 10))}
                min={1}
              />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="second-warning-time">Segundo Aviso (minutos)</Label>
              <Input
                id="second-warning-time"
                type="number"
                value={inactivityConfig.secondWarningTime}
                onChange={(e) => onInactivityChange('secondWarningTime', parseInt(e.target.value, 10))}
                min={inactivityConfig.firstWarningTime + 1}
              />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="close-time">Encerrar Conversa (minutos)</Label>
              <Input
                id="close-time"
                type="number"
                value={inactivityConfig.closeTime}
                onChange={(e) => onInactivityChange('closeTime', parseInt(e.target.value, 10))}
                min={inactivityConfig.secondWarningTime + 1}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Mensagens</h3>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="first-warning-message">Primeiro Aviso</Label>
              <Input
                id="first-warning-message"
                value={inactivityConfig.firstWarningMessage}
                onChange={(e) => onInactivityChange('firstWarningMessage', e.target.value)}
              />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="second-warning-message">Segundo Aviso</Label>
              <Input
                id="second-warning-message"
                value={inactivityConfig.secondWarningMessage}
                onChange={(e) => onInactivityChange('secondWarningMessage', e.target.value)}
              />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="closing-message">Mensagem de Encerramento</Label>
              <Input
                id="closing-message"
                value={inactivityConfig.closingMessage}
                onChange={(e) => onInactivityChange('closingMessage', e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InactivityTabContent;
