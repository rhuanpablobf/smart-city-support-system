
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

  // Check if demo departments already exist
  const { data: existingDepts } = await supabase
    .from('departments')
    .select('name')
    .in('name', ['Saúde', 'Educação']);
  
  // Create demo departments only if they don't exist
  let healthDept, educationDept;
  
  if (!existingDepts || !existingDepts.some(dept => dept.name === 'Saúde')) {
    const { data } = await supabase
      .from('departments')
      .insert({ name: 'Saúde', description: 'Secretaria de Saúde' })
      .select()
      .single();
    healthDept = data;
  } else {
    const { data } = await supabase
      .from('departments')
      .select()
      .eq('name', 'Saúde')
      .single();
    healthDept = data;
  }

  if (!existingDepts || !existingDepts.some(dept => dept.name === 'Educação')) {
    const { data } = await supabase
      .from('departments')
      .insert({ name: 'Educação', description: 'Secretaria de Educação' })
      .select()
      .single();
    educationDept = data;
  } else {
    const { data } = await supabase
      .from('departments')
      .select()
      .eq('name', 'Educação')
      .single();
    educationDept = data;
  }

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
