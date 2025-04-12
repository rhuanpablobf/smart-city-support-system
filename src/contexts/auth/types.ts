
import { User, UserRole } from '@/types';

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  hasPermission: (requiredRole: UserRole) => boolean;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const ROLE_HIERARCHY: { [key in UserRole]: number } = {
  'admin': 3,
  'manager': 2,
  'agent': 1,
  'user': 0,
};
