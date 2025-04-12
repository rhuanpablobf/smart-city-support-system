
import { supabase } from '@/integrations/supabase/client';
import { FilterOptions } from './types';

/**
 * Apply common filters to a Supabase query based on the provided filter options
 */
export const applyCommonFilters = (query: any, filters?: FilterOptions) => {
  // Apply department filter
  if (filters?.department && filters.department !== 'all') {
    query = query.eq('department_id', filters.department);
  }
  
  // Apply service filter
  if (filters?.service && filters.service !== 'all') {
    query = query.eq('service_id', filters.service);
  }
  
  // Apply date range filters
  if (filters?.period === 'custom' && filters.startDate && filters.endDate) {
    const startDateIso = filters.startDate.toISOString();
    const endDateIso = new Date(filters.endDate.getTime() + 86400000).toISOString(); // Add 1 day for inclusion
    
    query = query
      .gte('created_at', startDateIso)
      .lt('created_at', endDateIso);
  } else if (filters?.days) {
    // For predefined periods
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (filters.days));
    
    query = query.gte('created_at', startDate.toISOString());
  }
  
  return query;
};
