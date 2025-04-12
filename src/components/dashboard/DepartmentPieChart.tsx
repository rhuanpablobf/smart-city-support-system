
import React from 'react';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface DepartmentPieChartProps {
  data: Array<{
    name: string;
    count: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DepartmentPieChart: React.FC<DepartmentPieChartProps> = ({ data }) => {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Atendimentos por Departamento</CardTitle>
        <CardDescription>
          Distribuição entre secretarias
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {data.length > 0 ? (
          <ChartContainer className="h-80" config={{}}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend formatter={(value) => value} />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="h-80 flex items-center justify-center bg-gray-50">
            <span className="text-gray-500">Nenhum dado disponível</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentPieChart;
