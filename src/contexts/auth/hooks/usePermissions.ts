
import { useCallback } from 'react';
import { UserRole } from '@/types';
import { ROLE_HIERARCHY } from '../types';

export function usePermissions(userRole: UserRole | null) {
  const hasPermission = useCallback((requiredRole: UserRole): boolean => {
    if (!userRole) {
      console.log("hasPermission: Sem usuário atual");
      return false;
    }
    const userRoleLevel = ROLE_HIERARCHY[userRole] || 0;
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 0;
    
    const hasRole = userRoleLevel >= requiredRoleLevel;
    console.log(`hasPermission: Papel do usuário ${userRole} (${userRoleLevel}), papel necessário ${requiredRole} (${requiredRoleLevel}), resultado: ${hasRole}`);
    return hasRole;
  }, [userRole]);

  return { hasPermission };
}
