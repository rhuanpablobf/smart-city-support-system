
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DailyAttendancesChartProps {
  data: { date: string; count: number }[];
  period: string;
  loading: boolean;
}

const DailyAttendancesChart: React.FC<DailyAttendancesChartProps> = ({ data, period, loading }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const getPeriodDescription = () => {
    switch (period) {
      case 'today': return 'dias';
      case 'week': return '7 dias';
      case 'month': return '30 dias';
      case 'quarter': return '3 meses';
      case 'year': return '12 meses';
      default: return 'dias selecionados';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atendimentos por Dia</CardTitle>
        <CardDescription>
          Distribuição de atendimentos nos últimos {getPeriodDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
                interval={5}
              />
              <YAxis />
              <Tooltip labelFormatter={(label) => `Data: ${formatDate(label)}`} />
              <Line
                type="monotone"
                dataKey="count"
                name="Atendimentos"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <LineChartIcon className="h-16 w-16 text-gray-300" />
            <span className="ml-2 text-gray-500">Carregando dados...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyAttendancesChart;
