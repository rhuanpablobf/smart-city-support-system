
// This file would contain code to create demo users
// with different roles during development mode
import { supabase } from '../integrations/supabase/client';
import { UserRole } from '@/types';

export const createDemoUsers = async () => {
  if (process.env.NODE_ENV !== 'development') return;

  console.log('Creating demo users for development...');

  const demoUsers = [
    { email: 'master@example.com', password: 'password123', role: 'master' as UserRole, name: 'Master Admin' },
    { email: 'admin@example.com', password: 'password123', role: 'admin' as UserRole, name: 'Secretaria Admin' },
    { email: 'manager@example.com', password: 'password123', role: 'manager' as UserRole, name: 'Gerente' },
    { email: 'agent@example.com', password: 'password123', role: 'agent' as UserRole, name: 'Atendente' },
  ];

  for (const user of demoUsers) {
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', user.email)
        .limit(1);

      if (existingUsers && existingUsers.length > 0) {
        console.log(`User ${user.email} already exists, skipping...`);
        continue;
      }

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            name: user.name,
          }
        }
      });

      if (error) {
        console.error(`Error creating demo user ${user.email}:`, error.message);
        continue;
      }

      console.log(`Created demo user: ${user.email} with role ${user.role}`);

      if (data.user) {
        // Map our UserRole to the database enum values
        let dbRole: "admin" | "manager" | "agent" | "user" = "user";
        
        // Map the "master" role to "admin" for database compatibility
        // while preserving our application's distinction between them
        if (user.role === 'master') {
          dbRole = "admin"; // Store as admin in DB
        } else if (user.role === 'admin' || user.role === 'manager' || user.role === 'agent') {
          dbRole = user.role; // These roles match directly
        }

        // Create or update profile with proper role
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            name: user.name,
            email: user.email,
            role: dbRole, // Use the mapped role that matches Supabase's expected values
            status: 'active',
            max_simultaneous_chats: 5
          });

        if (profileError) {
          console.error(`Error setting role for ${user.email}:`, profileError.message);
        }
      }
    } catch (err) {
      console.error(`Unexpected error creating demo user ${user.email}:`, err);
    }
  }
};
