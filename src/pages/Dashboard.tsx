
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, PieChart } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Atendimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,456</div>
            <p className="text-xs text-muted-foreground">
              +12.2% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Atendimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.5 min</div>
            <p className="text-xs text-muted-foreground">
              -0.8 min em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Satisfação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos via Bot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,385</div>
            <p className="text-xs text-muted-foreground">
              56.3% do total de atendimentos
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Atendimentos por Dia</CardTitle>
            <CardDescription>
              Os últimos 30 dias de atividade
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-80 flex items-center justify-center bg-gray-50">
              <LineChart className="h-16 w-16 text-gray-300" />
              <span className="ml-2 text-gray-500">Dados de gráfico serão implementados aqui</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Atendimentos por Departamento</CardTitle>
            <CardDescription>
              Distribuição entre secretarias
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-80 flex items-center justify-center bg-gray-50">
              <PieChart className="h-16 w-16 text-gray-300" />
              <span className="ml-2 text-gray-500">Dados de gráfico serão implementados aqui</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Desempenho dos Atendentes</CardTitle>
          <CardDescription>
            Métricas comparativas dos últimos 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-96 flex items-center justify-center bg-gray-50">
            <BarChart className="h-16 w-16 text-gray-300" />
            <span className="ml-2 text-gray-500">Dados de gráfico serão implementados aqui</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
