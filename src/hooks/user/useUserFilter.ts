
import { useState, useEffect, useMemo } from 'react';
import { User } from '@/types';

export const useUserFilter = (users: User[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) {
      return users;
    }
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        (user.email && user.email.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (user.department && user.department.toLowerCase().includes(lowerCaseSearchTerm))
      );
    });
  }, [users, searchTerm]);
  
  return {
    filteredUsers,
    searchTerm,
    setSearchTerm,
  };
};
