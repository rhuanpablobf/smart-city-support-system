
import { useState, useMemo } from 'react';
import { User } from '@/types';

export function useUserFilter(users: User[]) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredUsers
  };
}
