
import { User } from '@/types';

export type AuthContextType = {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<User>;
  loading: boolean;
  error: string | null;
};
