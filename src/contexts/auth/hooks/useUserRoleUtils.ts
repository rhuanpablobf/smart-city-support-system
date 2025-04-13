
export function useUserRoleUtils() {
  // Verifica se é uma conta de demonstração
  const isDemoAccount = (email: string | undefined): boolean => {
    if (!email) return false;
    return email.endsWith('@example.com');
  };

  // Função de utilitário para determinar o papel do usuário com base no email
  const determineUserRole = (email: string | undefined) => {
    if (!email) return 'user';
    
    // Contas de demonstração com email específico
    if (email === 'master@example.com') return 'master';
    if (email === 'admin@example.com') return 'admin';
    if (email === 'manager@example.com') return 'manager';
    if (email === 'agent@example.com') return 'agent';
    
    // Verificação genérica por substring
    if (email.includes('master')) return 'master';
    if (email.includes('admin')) return 'admin';
    if (email.includes('manager')) return 'manager';
    if (email.includes('agent')) return 'agent';
    
    return 'user';
  };

  return {
    isDemoAccount,
    determineUserRole
  };
}
