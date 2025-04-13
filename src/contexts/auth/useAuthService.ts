
import { useState } from 'react';
import { User } from '@/types';
import { 
  useLogin,
  useLogout,
  usePermissions,
  useUserRoleUtils
} from './hooks';

export function useAuthService() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const { login } = useLogin();
  const logout = useLogout();
  const { hasPermission } = usePermissions(currentUser?.role || null);
  const { isDemoAccount, determineUserRole } = useUserRoleUtils();

  return {
    currentUser,
    setCurrentUser,
    loading,
    setLoading,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!currentUser,
    userRole: currentUser?.role || null,
    isDemoAccount,
    determineUserRole
  };
}
