
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DownloadIcon } from 'lucide-react';
import ReportFilters from '@/components/reports/ReportFilters';
import OverviewTab from '@/components/reports/OverviewTab';
import PerformanceTab from '@/components/reports/PerformanceTab';
import SatisfactionTab from '@/components/reports/SatisfactionTab';
import AgentsTab from '@/components/reports/AgentsTab';

const Reports = () => {
  const [period, setPeriod] = useState('month');
  const [department, setDepartment] = useState('all');
  
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
      />
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfação</TabsTrigger>
          <TabsTrigger value="agents">Atendentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <OverviewTab />
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
