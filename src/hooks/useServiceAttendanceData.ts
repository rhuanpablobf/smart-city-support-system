
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ServiceAttendanceData {
  name: string;
  value: number;
  color: string;
}

interface UseServiceAttendanceDataProps {
  period: string;
  department: string;
  service: string;
  startDate?: Date;
  endDate?: Date;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#83a6ed', '#8dd1e1'];

export const useServiceAttendanceData = ({
  period,
  department,
  service,
  startDate,
  endDate
}: UseServiceAttendanceDataProps) => {
  const [data, setData] = useState<ServiceAttendanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Calcular intervalo de datas com base no período
        const now = new Date();
        let fromDate = new Date();
        
        if (period === 'week') {
          fromDate.setDate(now.getDate() - 7);
        } else if (period === 'month') {
          fromDate.setMonth(now.getMonth() - 1);
        } else if (period === 'year') {
          fromDate.setFullYear(now.getFullYear() - 1);
        } else if (period === 'custom' && startDate && endDate) {
          fromDate = startDate;
        } else {
          // Default: últimos 30 dias
          fromDate.setDate(now.getDate() - 30);
        }

        // Construir a consulta inicial
        let query = supabase
          .from('conversations')
          .select(`
            service_id,
            services(name),
            count(*)
          `)
          .gte('created_at', fromDate.toISOString())
          .lt('created_at', period === 'custom' && endDate ? new Date(endDate.getTime() + 86400000).toISOString() : now.toISOString())
          .group('service_id, services(name)');

        // Adicionar filtro de departamento se não for 'all'
        if (department !== 'all') {
          query = query.eq('department_id', department);
        }

        // Adicionar filtro de serviço se não for 'all'
        if (service !== 'all') {
          query = query.eq('service_id', service);
        }

        const { data: serviceData, error } = await query;

        if (error) {
          throw error;
        }

        // Transformar dados para o formato esperado pelo gráfico
        const formattedData = (serviceData || []).map((item: any, index: number) => ({
          name: item.services?.name || 'Desconhecido',
          value: parseInt(item.count, 10),
          color: COLORS[index % COLORS.length]
        }));

        setData(formattedData);
        console.log("Dados de atendimentos por serviço:", formattedData);
      } catch (error) {
        console.error("Erro ao carregar dados de atendimentos por serviço:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, department, service, startDate, endDate]);

  return {
    data,
    loading
  };
};
