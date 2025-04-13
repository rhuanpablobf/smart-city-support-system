
import { createContext } from 'react';
import { AuthContextType } from './types';

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

export { AuthContext };
