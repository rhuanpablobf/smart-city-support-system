
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Save, Trash2 } from 'lucide-react';

const ChatbotConfig = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Configuração do Chatbot</h2>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="flows">
        <TabsList>
          <TabsTrigger value="flows">Fluxos de Conversação</TabsTrigger>
          <TabsTrigger value="responses">Respostas Automáticas</TabsTrigger>
          <TabsTrigger value="settings">Configurações Gerais</TabsTrigger>
        </TabsList>
        
        <TabsContent value="flows" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Autoatendimento</CardTitle>
              <CardDescription>
                Configure o fluxo de mensagens e opções para o atendimento automatizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="welcome-message">Mensagem de Boas-vindas</Label>
                <Input
                  id="welcome-message"
                  placeholder="Olá! Bem-vindo ao atendimento automático da Prefeitura..."
                  defaultValue="Olá! Bem-vindo ao atendimento da Prefeitura. Por favor, informe seu CPF para iniciarmos o atendimento."
                />
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Etapas do Fluxo</h3>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">1. Solicitação de CPF</span>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">Coleta o CPF do cidadão para registro do atendimento.</p>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">2. Escolha da Secretaria</span>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">Apresenta as secretarias disponíveis para o cidadão escolher.</p>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">3. Escolha do Serviço</span>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">Apresenta os serviços relacionados à secretaria escolhida.</p>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Nova Etapa
                  </Button>
                </div>
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
        </TabsContent>
        
        <TabsContent value="responses" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Respostas Padrão</CardTitle>
              <CardDescription>
                Configure mensagens automáticas para situações específicas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="timeout-message">Mensagem de Inatividade (1 min)</Label>
                <Input
                  id="timeout-message"
                  placeholder="Você está online?"
                  defaultValue="Você está online? Estamos aguardando sua resposta."
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="second-timeout">Segunda Mensagem de Inatividade (2 min)</Label>
                <Input
                  id="second-timeout"
                  placeholder="Ainda está aí?"
                  defaultValue="Ainda está aí? Se não responder, o atendimento será encerrado em breve."
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="closing-message">Mensagem de Encerramento</Label>
                <Input
                  id="closing-message"
                  placeholder="Atendimento encerrado"
                  defaultValue="Atendimento encerrado por inatividade. Caso precise, inicie uma nova conversa."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Ajuste parâmetros do comportamento do bot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="max-inactivity">Tempo máximo de inatividade (minutos)</Label>
                <Input
                  id="max-inactivity"
                  type="number"
                  defaultValue="3"
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="transfer-message">Mensagem de Transferência para Atendente</Label>
                <Input
                  id="transfer-message"
                  defaultValue="Transferindo para um atendente especializado. Por favor, aguarde um momento..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatbotConfig;
