
import React from 'react';
import StatsCard from './StatsCard';
import { OverviewStats } from '@/hooks/useOverviewData';

interface StatsCardGridProps {
  stats: OverviewStats;
}

const StatsCardGrid: React.FC<StatsCardGridProps> = ({ stats }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard 
        title="Total de Atendimentos" 
        value={stats.totalAttendances} 
        subValue="+12.2% em relação ao período anterior" 
      />
      
      <StatsCard 
        title="Atendimentos Bot" 
        value={stats.botAttendances} 
        subValue={`${stats.botPercentage}% do total de atendimentos`} 
      />
      
      <StatsCard 
        title="Atendimentos Humanos" 
        value={stats.humanAttendances} 
        subValue={`${stats.humanPercentage}% do total de atendimentos`} 
      />
      
      <StatsCard 
        title="Taxa de Transferência" 
        value={`${stats.transferRate}%`} 
        subValue={`${stats.transferRateChange}% em relação ao período anterior`} 
      />
    </div>
  );
};

export default StatsCardGrid;
