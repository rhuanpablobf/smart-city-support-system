
import React from 'react';
import StatsCard from './StatsCard';

interface StatsCardGridProps {
  stats: {
    totalAttendances: number;
    avgAttendanceTime: number;
    satisfactionRate: number;
    botAttendances: number;
    botPercentage: number;
  };
}

const StatsCardGrid: React.FC<StatsCardGridProps> = ({ stats }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard 
        title="Total de Atendimentos" 
        value={stats.totalAttendances.toLocaleString()} 
        subValue="Nos últimos 30 dias" 
      />
      
      <StatsCard 
        title="Tempo Médio de Atendimento" 
        value={`${stats.avgAttendanceTime} min`} 
        subValue="Entre mensagens" 
      />
      
      <StatsCard 
        title="Taxa de Satisfação" 
        value={`${stats.satisfactionRate}%`} 
        subValue="Baseado nas avaliações de usuários" 
      />
      
      <StatsCard 
        title="Atendimentos via Bot" 
        value={stats.botAttendances.toLocaleString()} 
        subValue={`${stats.botPercentage}% do total de atendimentos`} 
      />
    </div>
  );
};

export default StatsCardGrid;
