
export interface FilterOptions {
  period?: string;
  department?: string;
  service?: string;
  startDate?: Date;
  endDate?: Date;
  days?: number;
}

export interface DashboardStats {
  totalAttendances: number;
  avgAttendanceTime: number;
  satisfactionRate: number;
  botAttendances: number;
  botPercentage: number;
}

export interface DepartmentStat {
  name: string;
  count: number;
}

export interface DailyStat {
  date: string;
  count: number;
}

export interface AgentPerformance {
  id: string;
  name: string;
  conversations: number;
  avgResponseTime: number;
  messagesCount: number;
}
