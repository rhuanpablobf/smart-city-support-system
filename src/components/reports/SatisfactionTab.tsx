
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';

const SatisfactionTab: React.FC = () => {
  return (
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
  );
};

export default SatisfactionTab;
