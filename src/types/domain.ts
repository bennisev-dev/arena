export type DashboardDepartment = 'sales' | 'service' | 'all';

export type LeaderboardMetric =
  | 'leads_created'
  | 'cars_sold'
  | 'profit_total'
  | 'vehicle_value_total'
  | 'services_completed'
  | 'efficiency_rate';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  role: 'sales_rep' | 'service_rep' | 'manager';
  leadsCreated: number;
  carsSold: number;
  vehicleValueTotal: number;
  profitTotal: number;
  servicesCompleted: number;
  hoursBilled: number;
  hoursWorked: number;
  efficiencyRate: number;
  sortValue: number;
}

export interface LeaderboardResponse {
  month: number;
  year: number;
  role: 'sales_rep' | 'service_rep' | 'manager';
  department: DashboardDepartment;
  metric: LeaderboardMetric;
  summary: {
    totalLeadsCreated: number;
    totalProfit: number;
    totalCarsSold: number;
    totalVehicleValue: number;
    totalServicesCompleted: number;
    avgEfficiencyRate: number;
  };
  self: LeaderboardEntry | null;
  podium: LeaderboardEntry[];
  leaderboard: LeaderboardEntry[];
  serviceSecondaryLeaderboard?: LeaderboardEntry[];
}
