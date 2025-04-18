
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export as default for backward compatibility
export default useAuth;
