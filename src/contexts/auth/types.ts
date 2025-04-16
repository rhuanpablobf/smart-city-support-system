
import { User } from '@/types';

// Role hierarchy for permission checks
export const ROLE_HIERARCHY: Record<string, number> = {
  'master': 40,
  'admin': 30,
  'manager': 20,
  'agent': 10,
  'user': 0
};

export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<any>;
  updateUser: (userData: Partial<User>) => Promise<User>;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  userRole: string | null;
  hasPermission: (requiredRole: string) => boolean;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}
