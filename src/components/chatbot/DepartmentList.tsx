
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Save, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { ServiceList } from './ServiceList';
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
};

export const DepartmentList = ({ departments = [], onAddDepartment, onDeleteDepartment }: DepartmentListProps) => {
  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({ name: '', description: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({});

  const handleAddDepartment = () => {
    onAddDepartment(newDepartment);
    setNewDepartment({ name: '', description: '' });
    setOpenDialog(false);
  };

  const toggleDeptExpand = (deptId: string) => {
    setExpandedDepts((prev) => ({
      ...prev,
      [deptId]: !prev[deptId],
    }));
  };

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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept-desc">Descrição</Label>
                <Textarea
                  id="dept-desc"
                  value={newDepartment.description || ''}
                  onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                  placeholder="Descrição da secretaria e seus serviços"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={handleAddDepartment} disabled={!newDepartment.name}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {departments.length === 0 ? (
          <Card>
            <CardContent className="pt-4 text-center text-muted-foreground">
              Nenhuma secretaria cadastrada. Adicione uma nova para começar.
            </CardContent>
          </Card>
        ) : (
          departments.map((dept) => (
            <Card key={dept.id} className="border">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center cursor-pointer" onClick={() => toggleDeptExpand(dept.id)}>
                    {expandedDepts[dept.id] ? (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    <CardTitle className="text-lg">{dept.name}</CardTitle>
                  </div>
                  <Button variant="ghost" onClick={() => onDeleteDepartment(dept.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                {dept.description && <p className="text-sm text-muted-foreground">{dept.description}</p>}
              </CardHeader>
              {expandedDepts[dept.id] && (
                <CardContent className="pt-0">
                  <ServiceList departmentId={dept.id} />
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
