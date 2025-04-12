
import { supabase } from '@/integrations/supabase/client';

/**
 * Delete a user from the system
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error.message);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
