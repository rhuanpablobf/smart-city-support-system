
import { User, UserRole } from '@/types';

export interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | void>;
  logout: () => Promise<void>;
  updateUser?: (userData: Partial<User>) => Promise<User>;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  hasPermission: (requiredRole: UserRole) => boolean;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const ROLE_HIERARCHY: { [key in UserRole]: number } = {
  'master': 4,
  'admin': 3,
  'manager': 2,
  'agent': 1,
  'user': 0,
};
