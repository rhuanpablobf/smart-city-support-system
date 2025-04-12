
import React from 'react';
import { Label } from '@/components/ui/label';

const PreferencesTab: React.FC = () => {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold">Preferências</h3>
      <p className="text-muted-foreground">Configure suas preferências de atendimento</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="status">Status Padrão</Label>
          <select 
            id="status"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="online">Online</option>
            <option value="away">Ausente</option>
            <option value="busy">Ocupado</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PreferencesTab;
