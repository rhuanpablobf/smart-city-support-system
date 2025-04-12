
import { supabase } from '@/integrations/supabase/client';

export const createDemoUsers = async () => {
  // Check if users already exist to avoid duplicates
  const { data: existingUsers } = await supabase
    .from('profiles')
    .select('email')
    .in('email', ['admin@example.com', 'manager@example.com', 'agent@example.com']);

  if (existingUsers && existingUsers.length === 3) {
    console.log('Demo users already exist');
    return;
  }

  // Create demo departments
  const { data: healthDept } = await supabase
    .from('departments')
    .insert({ name: 'Saúde', description: 'Secretaria de Saúde' })
    .select()
    .single();

  const { data: educationDept } = await supabase
    .from('departments')
    .insert({ name: 'Educação', description: 'Secretaria de Educação' })
    .select()
    .single();

  // Create admin user
  const { data: adminAuthUser, error: adminError } = await supabase.auth.signUp({
    email: 'admin@example.com',
    password: 'password123',
    options: {
      data: {
        name: 'Admin User',
      }
    }
  });

  if (adminError) {
    console.error('Error creating admin user:', adminError);
  } else if (adminAuthUser.user) {
    await supabase
      .from('profiles')
      .update({ 
        role: 'admin',
        name: 'Admin User'
      })
      .eq('id', adminAuthUser.user.id);
  }

  // Create manager user
  const { data: managerAuthUser, error: managerError } = await supabase.auth.signUp({
    email: 'manager@example.com',
    password: 'password123',
    options: {
      data: {
        name: 'Manager User',
      }
    }
  });

  if (managerError) {
    console.error('Error creating manager user:', managerError);
  } else if (managerAuthUser.user && healthDept) {
    await supabase
      .from('profiles')
      .update({ 
        role: 'manager',
        name: 'Manager User',
        department_id: healthDept.id
      })
      .eq('id', managerAuthUser.user.id);
  }

  // Create agent user
  const { data: agentAuthUser, error: agentError } = await supabase.auth.signUp({
    email: 'agent@example.com',
    password: 'password123',
    options: {
      data: {
        name: 'Agent User',
      }
    }
  });

  if (agentError) {
    console.error('Error creating agent user:', agentError);
  } else if (agentAuthUser.user && educationDept) {
    await supabase
      .from('profiles')
      .update({ 
        role: 'agent',
        name: 'Agent User',
        department_id: educationDept.id,
        max_simultaneous_chats: 5
      })
      .eq('id', agentAuthUser.user.id);
  }

  console.log('Demo users created successfully');
};
