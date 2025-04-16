
import { useCallback } from 'react';
import { ROLE_HIERARCHY } from '../types';

export function usePermissions(userRole: string | null) {
  const hasPermission = useCallback((requiredRole: string): boolean => {
    if (!userRole) {
      console.log("hasPermission: No current user");
      return false;
    }
    const userRoleLevel = ROLE_HIERARCHY[userRole] || 0;
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 0;
    
    const hasRole = userRoleLevel >= requiredRoleLevel;
    console.log(`hasPermission: User role ${userRole} (${userRoleLevel}), required role ${requiredRole} (${requiredRoleLevel}), result: ${hasRole}`);
    return hasRole;
  }, [userRole]);

  return { hasPermission };
}
