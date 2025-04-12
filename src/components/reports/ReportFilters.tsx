
import React from 'react';
import PeriodFilter from './filters/PeriodFilter';
import DateRangeFilter from './filters/DateRangeFilter';
import DepartmentFilter from './filters/DepartmentFilter';
import ServiceFilter from './filters/ServiceFilter';
import SearchButton from './filters/SearchButton';
import { useReportFilters } from '@/hooks/useReportFilters';

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
  const {
    departments,
    services,
    isCalendarOpen,
    setIsCalendarOpen
  } = useReportFilters({
    initialPeriod: period,
    initialDepartment: department,
    initialService: service,
    onApplyFilters
  });

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      <PeriodFilter 
        period={period} 
        setPeriod={setPeriod} 
      />
      
      {period === 'custom' && (
        <DateRangeFilter 
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          isCalendarOpen={isCalendarOpen}
          setIsCalendarOpen={setIsCalendarOpen}
        />
      )}
      
      <DepartmentFilter 
        department={department}
        setDepartment={setDepartment}
        departments={departments}
      />

      <ServiceFilter
        service={service}
        setService={setService}
        services={services}
      />

      {period === 'custom' && (
        <SearchButton onClick={onApplyFilters} />
      )}
    </div>
  );
};

export default ReportFilters;
