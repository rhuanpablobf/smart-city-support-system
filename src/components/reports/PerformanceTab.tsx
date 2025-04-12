
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

const PerformanceTab: React.FC = () => {
  return (
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
  );
};

export default PerformanceTab;
