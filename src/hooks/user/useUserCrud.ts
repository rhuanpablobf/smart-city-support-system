
import { User, UserFormValues } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  addUser as addUserService,
  updateUser as updateUserService,
  deleteUser as deleteUserService
} from '@/services/user';
import { getDepartmentName } from '@/services/serviceService';

export function useUserCrud(users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>>) {
  const { toast } = useToast();

  // Add new user
  const addUser = async (userData: UserFormValues) => {
    try {
      // Ensure status is always defined
      const userDataWithStatus = {
        ...userData,
        status: userData.status || 'active'
      };
      
      const newUser = await addUserService(userDataWithStatus);
      
      // Update local state
      setUsers(prevUsers => [...prevUsers, newUser]);
      
      toast({
        title: "Usuário adicionado",
        description: "O novo usuário foi adicionado com sucesso.",
      });
      
      return newUser;
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar usuário",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Edit existing user
  const updateUser = async (userId: string, userData: UserFormValues) => {
    try {
      // Ensure status is always defined
      const userDataWithStatus = {
        ...userData,
        status: userData.status || 'active'
      };
      
      await updateUserService(userId, userDataWithStatus);
      
      // Fetch department name for display
      const departmentName = userData.department_id ? 
        await getDepartmentName(userData.department_id) : 
        null;
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                name: userData.name,
                email: userData.email,
                role: userData.role,
                department: departmentName,
                department_id: userData.department_id,
                serviceIds: userData.serviceIds,
                status: userDataWithStatus.status
              } 
            : user
        )
      );
      
      toast({
        title: "Usuário atualizado",
        description: "O usuário foi atualizado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    try {
      await deleteUserService(userId);
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover usuário",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    addUser,
    updateUser,
    deleteUser
  };
}
