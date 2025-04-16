
import { createContext } from 'react';
import { AuthContextType } from './types';

// Create auth context
export const AuthContext = createContext<AuthContextType | null>(null);

// Export as default for backward compatibility
export default AuthContext;
