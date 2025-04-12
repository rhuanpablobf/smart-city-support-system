
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

interface Department {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
}

export const useDepartmentsAndServices = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const { toast } = useToast();

  // Carrega departamentos quando o hook é inicializado
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('*');

        if (error) throw error;
        setDepartments(data || []);
      } catch (error) {
        console.error("Erro ao carregar departamentos:", error);
        toast({
          title: "Erro ao carregar departamentos",
          description: "Não foi possível carregar os departamentos.",
          variant: "destructive",
        });
      }
    };

    fetchDepartments();
  }, [toast]);

  // Quando o departamento muda, atualiza os serviços disponíveis
  useEffect(() => {
    if (selectedDepartment) {
      const fetchServicesForDepartment = async () => {
        try {
          const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('department_id', selectedDepartment);

          if (error) throw error;
          setServices(data || []);
        } catch (error) {
          console.error("Erro ao carregar serviços:", error);
          toast({
            title: "Erro ao carregar serviços",
            description: "Não foi possível carregar os serviços para este departamento.",
            variant: "destructive",
          });
        }
      };

      fetchServicesForDepartment();
    } else {
      setServices([]);
    }
  }, [selectedDepartment, toast]);

  return {
    departments,
    services,
    selectedDepartment,
    setSelectedDepartment,
    selectedService,
    setSelectedService
  };
};
