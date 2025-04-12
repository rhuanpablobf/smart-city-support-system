
import React from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import StatsCardGrid from '@/components/dashboard/StatsCardGrid';
import DailyAttendancesChart from '@/components/dashboard/DailyAttendancesChart';
import DepartmentPieChart from '@/components/dashboard/DepartmentPieChart';
import AgentPerformanceChart from '@/components/dashboard/AgentPerformanceChart';
import LoadingState from '@/components/dashboard/LoadingState';

const Dashboard = () => {
  const { 
    loading, 
    dashboardStats, 
    departmentStats, 
    dailyStats, 
    agentPerformance 
  } = useDashboardData();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <StatsCardGrid stats={dashboardStats} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <DailyAttendancesChart data={dailyStats} />
        <DepartmentPieChart data={departmentStats} />
      </div>
      
      <AgentPerformanceChart data={agentPerformance} />
    </div>
  );
};

export default Dashboard;
