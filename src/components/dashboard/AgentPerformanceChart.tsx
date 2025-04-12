
import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface AgentPerformanceChartProps {
  data: Array<{
    name: string;
    conversations: number;
    avgResponseTime: number;
  }>;
}

const AgentPerformanceChart: React.FC<AgentPerformanceChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempenho dos Atendentes</CardTitle>
        <CardDescription>
          Métricas comparativas dos últimos 30 dias
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {data.length > 0 ? (
          <ChartContainer className="h-96" config={{}}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="conversations" name="Atendimentos" fill="#8884d8" />
              <Bar dataKey="avgResponseTime" name="Média de Mensagens" fill="#82ca9d" />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-96 flex items-center justify-center bg-gray-50">
            <span className="text-gray-500">Nenhum dado disponível</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentPerformanceChart;
