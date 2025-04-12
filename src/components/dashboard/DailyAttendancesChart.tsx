
import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface DailyAttendancesChartProps {
  data: Array<{
    date: string;
    count: number;
  }>;
}

const DailyAttendancesChart: React.FC<DailyAttendancesChartProps> = ({ data }) => {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Atendimentos por Dia</CardTitle>
        <CardDescription>
          Os últimos 30 dias de atividade
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {data.length > 0 ? (
          <ChartContainer 
            className="h-80" 
            config={{ 
              activity: { label: "Atendimentos", theme: { light: "#2563eb", dark: "#3b82f6" }}
            }}
          >
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent 
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                    }}
                  />
                }
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                name="activity"
                stroke="#2563eb" 
                fillOpacity={1} 
                fill="url(#colorActivity)" 
              />
            </AreaChart>
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

export default DailyAttendancesChart;
