
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, DownloadIcon, LineChart, PieChart } from 'lucide-react';

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <Button>
          <DownloadIcon className="mr-2 h-4 w-4" />
          Exportar Dados
        </Button>
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Período:</label>
          <Select defaultValue="month">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Últimos 7 dias</SelectItem>
              <SelectItem value="month">Últimos 30 dias</SelectItem>
              <SelectItem value="quarter">Últimos 3 meses</SelectItem>
              <SelectItem value="year">Último ano</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Departamento:</label>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="health">Saúde</SelectItem>
              <SelectItem value="education">Educação</SelectItem>
              <SelectItem value="finance">Finanças</SelectItem>
              <SelectItem value="infrastructure">Infraestrutura</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfação</TabsTrigger>
          <TabsTrigger value="agents">Atendentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Atendimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,456</div>
                <p className="text-xs text-muted-foreground">
                  +12.2% em relação ao período anterior
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Atendimentos Bot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,385</div>
                <p className="text-xs text-muted-foreground">
                  56.3% do total de atendimentos
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Atendimentos Humanos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,071</div>
                <p className="text-xs text-muted-foreground">
                  43.7% do total de atendimentos
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Transferência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">35.6%</div>
                <p className="text-xs text-muted-foreground">
                  -2.3% em relação ao período anterior
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Atendimentos por Dia</CardTitle>
                <CardDescription>
                  Distribuição de atendimentos nos últimos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-80 flex items-center justify-center bg-gray-50">
                  <LineChart className="h-16 w-16 text-gray-300" />
                  <span className="ml-2 text-gray-500">Dados de gráfico serão implementados aqui</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Secretaria</CardTitle>
                <CardDescription>
                  Volume de atendimentos por departamento
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
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Desempenho</CardTitle>
              <CardDescription>
                Análise de tempo e eficiência no atendimento
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-96 flex items-center justify-center bg-gray-50">
                <BarChart3 className="h-16 w-16 text-gray-300" />
                <span className="ml-2 text-gray-500">Dados de gráfico serão implementados aqui</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="satisfaction" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Índice de Satisfação</CardTitle>
              <CardDescription>
                Avaliações dos cidadãos após atendimento
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-96 flex items-center justify-center bg-gray-50">
                <PieChart className="h-16 w-16 text-gray-300" />
                <span className="ml-2 text-gray-500">Dados de gráfico serão implementados aqui</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="agents" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho dos Atendentes</CardTitle>
              <CardDescription>
                Comparativo de métricas por atendente
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-96 flex items-center justify-center bg-gray-50">
                <BarChart3 className="h-16 w-16 text-gray-300" />
                <span className="ml-2 text-gray-500">Dados de gráfico serão implementados aqui</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
