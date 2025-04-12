
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DepartmentPieChartProps {
  data: { name: string; count: number; color: string }[];
  loading: boolean;
}

const DepartmentPieChart: React.FC<DepartmentPieChartProps> = ({ data, loading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Secretaria</CardTitle>
        <CardDescription>
          Volume de atendimentos por departamento
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
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
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <PieChartIcon className="h-16 w-16 text-gray-300" />
            <span className="ml-2 text-gray-500">Carregando dados...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentPieChart;
