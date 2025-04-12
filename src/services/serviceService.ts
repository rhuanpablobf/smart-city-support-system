
import { Service } from '@/types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetch services from Supabase
 */
export const fetchServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*');

  if (error) throw error;
  
  return data;
};

/**
 * Get department name by department ID
 */
export const getDepartmentName = async (departmentId: string): Promise<string | null> => {
  if (!departmentId) return null;
  
  const { data, error } = await supabase
    .from('departments')
    .select('name')
    .eq('id', departmentId)
    .single();
    
  if (error || !data) return null;
  
  return data.name;
};
