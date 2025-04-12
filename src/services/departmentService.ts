
import { Department } from '@/types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetch departments from Supabase
 */
export const fetchDepartments = async (): Promise<Department[]> => {
  const { data, error } = await supabase
    .from('departments')
    .select('*');

  if (error) throw error;
  
  return data;
};
