
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Save, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
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
import { Service } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type ServiceListProps = {
  departmentId: string;
};

export const ServiceList = ({ departmentId }: ServiceListProps) => {
  const [newService, setNewService] = useState<Partial<Service>>({ 
    name: '', 
    description: '', 
    departmentId: departmentId 
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [expandedServices, setExpandedServices] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services', departmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('department_id', departmentId);

      if (error) throw error;
      
      return data.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description || '',
        departmentId: service.department_id
      }));
    }
  });

  const addServiceMutation = useMutation({
    mutationFn: async (newService: Partial<Service>) => {
      const { data, error } = await supabase
        .from('services')
        .insert({
          name: newService.name,
          description: newService.description || '',
          department_id: departmentId
        })
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', departmentId] });
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      return serviceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', departmentId] });
    }
  });

  const handleAddService = () => {
    if (newService.name) {
      addServiceMutation.mutate(newService);
      setNewService({ name: '', description: '', departmentId });
      setOpenDialog(false);
    }
  };

  const toggleServiceExpand = (serviceId: string) => {
    setExpandedServices((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  };

  if (isLoading) {
    return <div className="py-4 text-center">Carregando serviços...</div>;
  }

  return (
    <div className="space-y-4 pl-4 border-l-2 ml-2 mt-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Serviços</h4>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-3 w-3" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Serviço</DialogTitle>
              <DialogDescription>
                Adicione um novo serviço para esta secretaria.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service-name">Nome do Serviço</Label>
                <Input
                  id="service-name"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="Ex: Agendamento de Consulta"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-desc">Descrição</Label>
                <Textarea
                  id="service-desc"
                  value={newService.description || ''}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Descrição do serviço"
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
          <div className="text-sm text-muted-foreground py-2">
            Nenhum serviço cadastrado para esta secretaria.
          </div>
        ) : (
          services.map((service) => (
            <Card key={service.id} className="border">
              <CardHeader className="p-3 pb-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center cursor-pointer" onClick={() => toggleServiceExpand(service.id)}>
                    {expandedServices[service.id] ? (
                      <ChevronDown className="h-3 w-3 mr-1" />
                    ) : (
                      <ChevronRight className="h-3 w-3 mr-1" />
                    )}
                    <CardTitle className="text-base">{service.name}</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteServiceMutation.mutate(service.id)}
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </div>
                {service.description && <p className="text-xs text-muted-foreground">{service.description}</p>}
              </CardHeader>
              {expandedServices[service.id] && (
                <CardContent className="pt-0 pb-2">
                  <QAList serviceId={service.id} />
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
