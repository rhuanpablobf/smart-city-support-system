
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, PieChart } from 'lucide-react';

const OverviewTab: React.FC = () => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default OverviewTab;
