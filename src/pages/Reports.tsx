
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DownloadIcon } from 'lucide-react';
import ReportFilters from '@/components/reports/ReportFilters';
import OverviewTab from '@/components/reports/OverviewTab';
import PerformanceTab from '@/components/reports/PerformanceTab';
import SatisfactionTab from '@/components/reports/SatisfactionTab';
import AgentsTab from '@/components/reports/AgentsTab';
import { useToast } from '@/components/ui/use-toast';

const Reports = () => {
  const [period, setPeriod] = useState('month');
  const [department, setDepartment] = useState('all');
  const [service, setService] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [filterApplied, setFilterApplied] = useState(false);
  const { toast } = useToast();
  
  // Apply filters when values change (except for custom period)
  useEffect(() => {
    if (period !== 'custom') {
      handleApplyFilters();
    }
  }, [period, department, service]);

  const handleApplyFilters = () => {
    // Validate dates for custom period
    if (period === 'custom' && (!startDate || !endDate)) {
      toast({
        title: "Período incompleto",
        description: "Por favor, selecione data de início e fim para o período personalizado.",
        variant: "destructive"
      });
      return;
    }

    setFilterApplied(true);
    
    // Here you can implement logic to update the reports data
    console.log('Filtros aplicados:', { period, department, service, startDate, endDate });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <Button>
          <DownloadIcon className="mr-2 h-4 w-4" />
          Exportar Dados
        </Button>
      </div>
      
      <ReportFilters 
        period={period}
        setPeriod={setPeriod}
        department={department}
        setDepartment={setDepartment}
        service={service}
        setService={setService}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        onApplyFilters={handleApplyFilters}
      />
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfação</TabsTrigger>
          <TabsTrigger value="agents">Atendentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <OverviewTab 
            period={period}
            department={department}
            service={service}
            startDate={startDate}
            endDate={endDate}
          />
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4 mt-4">
          <PerformanceTab />
        </TabsContent>
        
        <TabsContent value="satisfaction" className="space-y-4 mt-4">
          <SatisfactionTab />
        </TabsContent>
        
        <TabsContent value="agents" className="space-y-4 mt-4">
          <AgentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
