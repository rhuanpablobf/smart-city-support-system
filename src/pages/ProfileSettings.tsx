
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth';
import ProfileTab from '@/components/profile/ProfileTab';
import PreferencesTab from '@/components/profile/PreferencesTab';
import SecurityTab from '@/components/profile/SecurityTab';

const ProfileSettings = () => {
  const { currentUser, setCurrentUser } = useAuth();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>

      <Tabs defaultValue="profile">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6 mt-6">
          <ProfileTab currentUser={currentUser} setCurrentUser={setCurrentUser} />
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6 mt-6">
          <PreferencesTab />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6 mt-6">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileSettings;
