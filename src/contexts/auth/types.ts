
import { User } from '@/types';

export type AuthContextType = {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<User>;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  userRole: string | null;
  hasPermission: (requiredRole: string) => boolean;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
};

// Add ROLE_HIERARCHY to define role levels
export const ROLE_HIERARCHY: Record<string, number> = {
  master: 4,
  admin: 3,
  manager: 2,
  agent: 1,
  user: 0
};
