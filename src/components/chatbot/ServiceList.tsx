
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Save, Trash2, Edit } from 'lucide-react';
import { QAList } from './QAList';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/types';

type ServiceListProps = {
  departmentId: string;
};

export const ServiceList = ({ departmentId }: ServiceListProps) => {
  const [newService, setNewService] = useState<Service>({
    id: '',
    name: '',
    description: '',
    department_id: departmentId 
  });
  const [editService, setEditService] = useState<Service | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [expandedServices, setExpandedServices] = useState<Record<string, boolean>>({});
  
  const queryClient = useQueryClient();

  // Fetch services for the department
  const { data: services = [] } = useQuery({
    queryKey: ['services', departmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('department_id', departmentId);

      if (error) throw error;
      return data;
    },
  });

  // Add service mutation
  const addServiceMutation = useMutation({
    mutationFn: async (serviceData: Service) => {
      const { data, error } = await supabase
        .from('services')
        .insert({
          name: serviceData.name,
          description: serviceData.description,
          department_id: serviceData.department_id
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', departmentId] });
      setNewService({ 
        id: '',
        name: '', 
        description: '', 
        department_id: departmentId  
      });
      setOpenDialog(false);
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async (serviceData: Service) => {
      const { data, error } = await supabase
        .from('services')
        .update({
          name: serviceData.name,
          description: serviceData.description
        })
        .eq('id', serviceData.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', departmentId] });
      setEditService(null);
      setOpenEditDialog(false);
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', departmentId] });
    },
  });

  const handleAddService = () => {
    if (newService.name) {
      addServiceMutation.mutate(newService);
    }
  };

  const handleUpdateService = () => {
    if (editService?.name && editService?.id) {
      updateServiceMutation.mutate(editService);
    }
  };

  const handleDeleteService = (serviceId: string) => {
    deleteServiceMutation.mutate(serviceId);
  };

  const toggleServiceExpand = (serviceId: string) => {
    setExpandedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  const startEditService = (service: Service) => {
    setEditService(service);
    setOpenEditDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium">Serviços</h4>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Serviço</DialogTitle>
              <DialogDescription>
                Crie um novo serviço para esta secretaria.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="service-name">Nome do Serviço</Label>
                <Input
                  id="service-name"
                  value={newService.name || ''}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="Ex: Agendamento de Consultas"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-desc">Descrição</Label>
                <Textarea
                  id="service-desc"
                  value={newService.description || ''}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Descrição do serviço oferecido"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={handleAddService} disabled={!newService.name}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {services.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground border rounded-md p-4">
            Nenhum serviço cadastrado para esta secretaria.
          </div>
        ) : (
          services.map((service: Service) => (
            <Card key={service.id} className="border">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div 
                    className="flex-1 cursor-pointer" 
                    onClick={() => toggleServiceExpand(service.id)}
                  >
                    <h5 className="font-medium">{service.name}</h5>
                    {service.description && (
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEditService(service)}>
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteService(service.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
                
                {expandedServices[service.id] && (
                  <div className="mt-4 border-t pt-4">
                    <QAList serviceId={service.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Service Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Serviço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-service-name">Nome do Serviço</Label>
              <Input
                id="edit-service-name"
                value={editService?.name || ''}
                onChange={(e) => setEditService(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Nome do serviço"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-service-desc">Descrição</Label>
              <Textarea
                id="edit-service-desc"
                value={editService?.description || ''}
                onChange={(e) => setEditService(prev => prev ? { ...prev, description: e.target.value } : null)}
                placeholder="Descrição do serviço"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleUpdateService} disabled={!editService?.name}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
