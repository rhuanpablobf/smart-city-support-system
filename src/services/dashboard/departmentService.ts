
import { supabase } from '@/integrations/supabase/client';
import { FilterOptions, DepartmentStat } from './types';
import { applyCommonFilters } from './utils';

/**
 * Fetch department statistics with filters
 */
export const fetchDepartmentStats = async (filters?: FilterOptions): Promise<DepartmentStat[]> => {
  try {
    let query = supabase
      .from('conversations')
      .select(`
        department_id,
        departments!inner(name)
      `);
    
    query = applyCommonFilters(query, filters);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Group and count conversations by department
    const departmentCounts: Record<string, {name: string, count: number}> = {};
    
    data?.forEach(item => {
      const deptId = item.department_id;
      const deptName = item.departments?.name || 'Unknown';
      
      if (!departmentCounts[deptId]) {
        departmentCounts[deptId] = { name: deptName, count: 0 };
      }
      departmentCounts[deptId].count++;
    });
    
    return Object.values(departmentCounts);
  } catch (error) {
    console.error("Error fetching department stats:", error);
    return [];
  }
};
