
import { supabase } from '@/integrations/supabase/client';
import { FilterOptions, DailyStat } from './types';
import { applyCommonFilters } from './utils';

/**
 * Fetch daily attendance statistics with filters
 */
export const fetchDailyStats = async (days: number = 30, filters?: FilterOptions): Promise<DailyStat[]> => {
  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    if (filters?.period === 'custom' && filters.startDate && filters.endDate) {
      // Use custom date range
      startDate.setTime(filters.startDate.getTime());
      endDate.setTime(filters.endDate.getTime());
      // Add one day to endDate to include the last day completely
      endDate.setDate(endDate.getDate() + 1);
      
      // Recalculate days based on selected dates
      days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      // Use predefined range
      startDate.setDate(startDate.getDate() - days);
    }
    
    let query = supabase
      .from('conversations')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    query = applyCommonFilters(query, filters);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Initialize daily counts with zeros for all days
    const dailyCounts: Record<string, number> = {};
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      dailyCounts[dateString] = 0;
    }
    
    // Count conversations by day
    data?.forEach(conversation => {
      const date = new Date(conversation.created_at).toISOString().split('T')[0];
      if (dailyCounts[date] !== undefined) {
        dailyCounts[date]++;
      }
    });
    
    // Convert to array format for chart
    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error fetching daily stats:", error);
    return [];
  }
};
