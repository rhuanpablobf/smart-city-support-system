
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Department {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
}

export interface ReportFiltersState {
  period: string;
  department: string;
  service: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  isCalendarOpen: boolean;
}

export interface ReportFiltersActions {
  setPeriod: (value: string) => void;
  setDepartment: (value: string) => void;
  setService: (value: string) => void;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
  setIsCalendarOpen: (value: boolean) => void;
  onApplyFilters: () => void;
}

export interface UseReportFiltersProps {
  initialPeriod?: string;
  initialDepartment?: string;
  initialService?: string;
  onApplyFilters: () => void;
}

export const useReportFilters = ({
  initialPeriod = 'month',
  initialDepartment = 'all',
  initialService = 'all',
  onApplyFilters
}: UseReportFiltersProps) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  const [state, setState] = useState<ReportFiltersState>({
    period: initialPeriod,
    department: initialDepartment,
    service: initialService,
    startDate: undefined,
    endDate: undefined,
    isCalendarOpen: false
  });

  // Helper function to update state
  const updateState = (newState: Partial<ReportFiltersState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  // Actions to update individual state properties
  const actions: ReportFiltersActions = {
    setPeriod: (value) => updateState({ period: value }),
    setDepartment: (value) => {
      updateState({ department: value, service: 'all' });
    },
    setService: (value) => updateState({ service: value }),
    setStartDate: (date) => updateState({ startDate: date }),
    setEndDate: (date) => updateState({ endDate: date }),
    setIsCalendarOpen: (value) => updateState({ isCalendarOpen: value }),
    onApplyFilters
  };

  // Load departments from database
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('id, name');
        
        if (error) throw error;
        setDepartments(data || []);
      } catch (error) {
        console.error('Erro ao carregar departamentos:', error);
      }
    };

    fetchDepartments();
  }, []);

  // Load services based on selected department
  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Constrói a query base para selecionar serviços
        let query = supabase
          .from('services')
          .select('id, name');
        
        // Se um departamento específico for selecionado, filtra por ele
        if (state.department !== 'all') {
          query = query.eq('department_id', state.department);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setServices(data || []);
        console.log(`Serviços carregados para o departamento ${state.department}:`, data?.length || 0);
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
      }
    };

    fetchServices();
  }, [state.department]);

  // Clear dates when period is not custom
  useEffect(() => {
    if (state.period !== 'custom') {
      updateState({ startDate: undefined, endDate: undefined });
    }
  }, [state.period]);

  return {
    ...state,
    departments,
    services,
    ...actions
  };
};
