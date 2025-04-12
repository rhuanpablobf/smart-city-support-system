
import React, { useState, useEffect } from 'react';
import { CalendarIcon, SearchIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface ReportFiltersProps {
  period: string;
  setPeriod: (value: string) => void;
  department: string;
  setDepartment: (value: string) => void;
  service: string;
  setService: (value: string) => void;
  startDate: Date | undefined;
  endDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
  onApplyFilters: () => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  period,
  setPeriod,
  department,
  setDepartment,
  service,
  setService,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onApplyFilters
}) => {
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);
  const [services, setServices] = useState<{id: string, name: string}[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Carregar departamentos do banco de dados
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

  // Carregar serviços com base no departamento selecionado
  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Se departamento for "all", busque todos os serviços
        let query = supabase
          .from('services')
          .select('id, name');
        
        if (department !== 'all') {
          query = query.eq('department_id', department);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        setServices(data || []);

        // Reseta o serviço selecionado quando o departamento muda
        if (service !== 'all') {
          setService('all');
        }
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
      }
    };

    fetchServices();
  }, [department, setService]);

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium">Período:</label>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Últimos 7 dias</SelectItem>
            <SelectItem value="month">Últimos 30 dias</SelectItem>
            <SelectItem value="quarter">Últimos 3 meses</SelectItem>
            <SelectItem value="year">Último ano</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {period === 'custom' && (
        <div className="flex flex-wrap items-center gap-2">
          <div>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-[240px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate && endDate ? (
                    <>
                      {format(startDate, 'dd/MM/yyyy')} - {format(endDate, 'dd/MM/yyyy')}
                    </>
                  ) : (
                    <span>Selecione o período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: startDate,
                    to: endDate,
                  }}
                  onSelect={(range) => {
                    setStartDate(range?.from);
                    setEndDate(range?.to);
                  }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium">Departamento:</label>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium">Serviço:</label>
        <Select value={service} onValueChange={setService}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Serviço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {services.map((serv) => (
              <SelectItem key={serv.id} value={serv.id}>
                {serv.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {period === 'custom' && (
        <Button 
          onClick={onApplyFilters}
          className="ml-auto"
        >
          <SearchIcon className="h-4 w-4 mr-2" />
          Buscar
        </Button>
      )}
    </div>
  );
};

export default ReportFilters;
