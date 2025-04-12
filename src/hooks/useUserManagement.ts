
import { useUsersFetch } from './user/useUsersFetch';
import { useUserFilter } from './user/useUserFilter';
import { useUserCrud } from './user/useUserCrud';
import { UserFormValues } from '@/types';

// Using 'export type' instead of 'export' to fix the TS1205 error
export type { UserFormValues };

export function useUserManagement() {
  const { users, setUsers, departments, services, loading, refreshUsers } = useUsersFetch();
  const { searchTerm, setSearchTerm, filteredUsers } = useUserFilter(users);
  const { addUser, updateUser, deleteUser } = useUserCrud(users, setUsers);
  
  return {
    users,
    departments,
    services,
    filteredUsers,
    searchTerm,
    setSearchTerm,
    addUser,
    updateUser,
    deleteUser,
    loading,
    refreshUsers
  };
}
