
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { DepartmentCard } from './DepartmentCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Department } from '@/types';

type DepartmentListProps = {
  departments: Department[];
  onAddDepartment: (department: Partial<Department>) => void;
  onDeleteDepartment: (id: string) => void;
  isLoading: boolean;
  isAddingDepartment: boolean;
};

export const DepartmentList = ({ 
  departments = [], 
  onAddDepartment, 
  onDeleteDepartment,
  isLoading,
  isAddingDepartment
}: DepartmentListProps) => {
  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({ name: '', description: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({});

  const handleAddDepartment = () => {
    onAddDepartment(newDepartment);
  };

  const toggleDeptExpand = (deptId: string) => {
    setExpandedDepts((prev) => ({
      ...prev,
      [deptId]: !prev[deptId],
    }));
  };
  
  // Reset form values when dialog closes
  useEffect(() => {
    if (!openDialog) {
      setNewDepartment({ name: '', description: '' });
    }
  }, [openDialog]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Secretarias (Departamentos)</h3>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Secretaria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Secretaria</DialogTitle>
              <DialogDescription>
                Crie uma nova secretaria para organizar os serviços oferecidos.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dept-name">Nome da Secretaria</Label>
                <Input
                  id="dept-name"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  placeholder="Ex: Secretaria de Saúde"
                  disabled={isAddingDepartment}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept-desc">Descrição</Label>
                <Textarea
                  id="dept-desc"
                  value={newDepartment.description || ''}
                  onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                  placeholder="Descrição da secretaria e seus serviços"
                  disabled={isAddingDepartment}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)} disabled={isAddingDepartment}>
                Cancelar
              </Button>
              <Button onClick={handleAddDepartment} disabled={!newDepartment.name || isAddingDepartment}>
                {isAddingDepartment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  'Adicionar'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <Card>
            <CardContent className="pt-4 flex items-center justify-center h-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : departments.length === 0 ? (
          <Card>
            <CardContent className="pt-4 text-center text-muted-foreground">
              Nenhuma secretaria cadastrada. Adicione uma nova para começar.
            </CardContent>
          </Card>
        ) : (
          departments.map((dept) => (
            <DepartmentCard
              key={dept.id}
              department={dept}
              expanded={!!expandedDepts[dept.id]}
              onToggleExpand={() => toggleDeptExpand(dept.id)}
              onDeleteDepartment={() => onDeleteDepartment(dept.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
