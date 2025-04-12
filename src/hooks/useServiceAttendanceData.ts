
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Service {
  id: string;
  name: string;
  attendances: number;
}

interface ServiceAttendanceFilters {
  period: string;
  department: string;
  service: string;
  startDate?: Date;
  endDate?: Date;
}

interface ServiceAttendanceData {
  data: Service[];
  loading: boolean;
}

export const useServiceAttendanceData = (filters: ServiceAttendanceFilters): ServiceAttendanceData => {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Base query for services
        let query = supabase
          .from('services')
          .select('id, name');
          
        // Apply department filter
        if (filters.department && filters.department !== 'all') {
          query = query.eq('department_id', filters.department);
        }
        
        const { data: servicesData, error: servicesError } = await query;
        
        if (servicesError) throw servicesError;
        
        // For each service, count the number of attendances
        const servicesWithAttendances = await Promise.all(
          servicesData.map(async (service) => {
            let countQuery = supabase
              .from('conversations')
              .select('id', { count: 'exact', head: true });
              
            // Filter by service
            countQuery = countQuery.eq('service_id', service.id);
            
            // Apply date filters based on period
            if (filters.period === 'custom' && filters.startDate && filters.endDate) {
              const startDate = new Date(filters.startDate);
              const endDate = new Date(filters.endDate);
              
              startDate.setHours(0, 0, 0, 0);
              endDate.setHours(23, 59, 59, 999);
              
              countQuery = countQuery
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString());
            } else if (filters.period === 'today') {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              countQuery = countQuery.gte('created_at', today.toISOString());
            } else if (filters.period === 'week') {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              
              countQuery = countQuery.gte('created_at', weekAgo.toISOString());
            } else if (filters.period === 'month') {
              const monthAgo = new Date();
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              
              countQuery = countQuery.gte('created_at', monthAgo.toISOString());
            }
            
            const { count } = await countQuery;
            
            return {
              id: service.id,
              name: service.name,
              attendances: count || 0
            };
          })
        );
        
        // Sort by number of attendances (descending)
        const sortedServices = servicesWithAttendances.sort(
          (a, b) => b.attendances - a.attendances
        );
        
        setData(sortedServices);
      } catch (error) {
        console.error('Error fetching service attendance data:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);
  
  return { data, loading };
};
