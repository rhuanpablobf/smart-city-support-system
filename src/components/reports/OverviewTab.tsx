
import React from 'react';
import { useOverviewData } from '@/hooks/useOverviewData';
import StatsCardGrid from './cards/StatsCardGrid';
import DailyAttendancesChart from './charts/DailyAttendancesChart';
import DepartmentPieChart from './charts/DepartmentPieChart';

interface OverviewTabProps {
  period: string;
  department: string;
  service: string;
  startDate?: Date;
  endDate?: Date;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ 
  period, 
  department, 
  service,
  startDate,
  endDate 
}) => {
  const filters = { period, department, service, startDate, endDate };
  const { stats, dailyData, departmentData, loading } = useOverviewData(filters);

  return (
    <div className="space-y-4">
      <StatsCardGrid stats={stats} />
      
      <div className="grid gap-4 md:grid-cols-2">
        <DailyAttendancesChart 
          data={dailyData} 
          period={period} 
          loading={loading} 
        />
        
        <DepartmentPieChart 
          data={departmentData} 
          loading={loading} 
        />
      </div>
    </div>
  );
};

export default OverviewTab;
