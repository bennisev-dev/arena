import type { Role } from '@prisma/client';
import { db } from '@/lib/db';
import type { DashboardDepartment, LeaderboardEntry, LeaderboardMetric, LeaderboardResponse } from '@/types/domain';

const metricLabels: Record<LeaderboardMetric, keyof LeaderboardEntry> = {
  leads_created: 'leadsCreated',
  cars_sold: 'carsSold',
  profit_total: 'profitTotal',
  vehicle_value_total: 'vehicleValueTotal',
  services_completed: 'servicesCompleted',
  efficiency_rate: 'efficiencyRate'
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;
  if (value && typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  return 0;
};

const calculateEfficiencyRate = (hoursBilled: number, hoursWorked: number): number => {
  if (hoursWorked <= 0) return 0;
  return (hoursBilled / hoursWorked) * 100;
};

const normalizeMetric = (role: Role, metric: LeaderboardMetric): LeaderboardMetric => {
  if (role === 'sales_rep') {
    if (['leads_created', 'cars_sold', 'profit_total', 'vehicle_value_total'].includes(metric)) return metric;
    return 'leads_created';
  }

  if (role === 'service_rep') {
    if (['services_completed', 'efficiency_rate', 'profit_total'].includes(metric)) return metric;
    return 'services_completed';
  }

  return metric;
};

const normalizeDepartment = (role: Role, department: DashboardDepartment): DashboardDepartment => {
  if (role === 'sales_rep') return 'sales';
  if (role === 'service_rep') return 'service';
  return department;
};

const buildEntry = (
  userId: string,
  name: string,
  role: Role,
  leadsCreated: number,
  carsSold: number,
  vehicleValueTotal: number,
  profitTotal: number,
  servicesCompleted: number,
  hoursBilled: number,
  hoursWorked: number
): LeaderboardEntry => {
  const efficiencyRate = calculateEfficiencyRate(hoursBilled, hoursWorked);

  return {
    userId,
    name,
    role,
    leadsCreated,
    carsSold,
    vehicleValueTotal,
    profitTotal,
    servicesCompleted,
    hoursBilled,
    hoursWorked,
    efficiencyRate,
    sortValue: 0
  };
};

const sortEntries = (entries: LeaderboardEntry[], metric: LeaderboardMetric): LeaderboardEntry[] => {
  const metricKey = metricLabels[metric];

  return entries
    .map((entry) => ({
      ...entry,
      sortValue: Number(entry[metricKey])
    }))
    .sort((a, b) => b.sortValue - a.sortValue);
};

const buildSummary = (entries: LeaderboardEntry[]) => {
  const totalLeadsCreated = entries.reduce((sum, entry) => sum + entry.leadsCreated, 0);
  const totalProfit = entries.reduce((sum, entry) => sum + entry.profitTotal, 0);
  const totalCarsSold = entries.reduce((sum, entry) => sum + entry.carsSold, 0);
  const totalVehicleValue = entries.reduce((sum, entry) => sum + entry.vehicleValueTotal, 0);
  const totalServicesCompleted = entries.reduce((sum, entry) => sum + entry.servicesCompleted, 0);
  const avgEfficiencyRate = entries.length
    ? entries.reduce((sum, entry) => sum + entry.efficiencyRate, 0) / entries.length
    : 0;

  return {
    totalLeadsCreated,
    totalProfit,
    totalCarsSold,
    totalVehicleValue,
    totalServicesCompleted,
    avgEfficiencyRate
  };
};

interface LeaderboardInput {
  viewerUserId: string;
  organizationId: string | null;
  role: Role;
  dealershipId: string;
  metric: LeaderboardMetric;
  department: DashboardDepartment;
}

export const getLeaderboard = async ({
  viewerUserId,
  organizationId,
  role,
  dealershipId,
  metric,
  department
}: LeaderboardInput): Promise<LeaderboardResponse> => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const normalizedMetric = normalizeMetric(role, metric);
  const normalizedDepartment = normalizeDepartment(role, department);

  const roleFilter: Role[] =
    normalizedDepartment === 'sales'
      ? ['sales_rep']
      : normalizedDepartment === 'service'
        ? ['service_rep']
        : ['sales_rep', 'service_rep'];

  const userFilter: { dealership_id: string; role: { in: Role[] }; organization_id?: string } = {
    dealership_id: dealershipId,
    role: { in: roleFilter }
  };
  if (organizationId != null) {
    userFilter.organization_id = organizationId;
  }

  const performances = await db.performance.findMany({
    where: {
      month,
      year,
      user: userFilter
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true
        }
      }
    }
  });

  const grouped = new Map<string, LeaderboardEntry>();

  for (const row of performances) {
    if (!row.user.role) continue;
    const existing = grouped.get(row.user.id);

    if (!existing) {
      grouped.set(
        row.user.id,
        buildEntry(
          row.user.id,
          row.user.name,
          row.user.role,
          row.leads_created,
          row.cars_sold,
          toNumber(row.vehicle_value_total),
          toNumber(row.profit_total),
          row.services_completed,
          toNumber(row.hours_billed),
          toNumber(row.hours_worked)
        )
      );
      continue;
    }

    existing.leadsCreated += row.leads_created;
    existing.carsSold += row.cars_sold;
    existing.vehicleValueTotal += toNumber(row.vehicle_value_total);
    existing.profitTotal += toNumber(row.profit_total);
    existing.servicesCompleted += row.services_completed;
    existing.hoursBilled += toNumber(row.hours_billed);
    existing.hoursWorked += toNumber(row.hours_worked);
    existing.efficiencyRate = calculateEfficiencyRate(existing.hoursBilled, existing.hoursWorked);
  }

  const entries = Array.from(grouped.values());
  const sorted = sortEntries(entries, normalizedMetric);

  const podium = sorted.slice(0, 3);
  const leaderboard = sorted.slice(3);
  const self = sorted.find((entry) => entry.userId === viewerUserId) ?? null;

  const response: LeaderboardResponse = {
    month,
    year,
    role,
    department: normalizedDepartment,
    metric: normalizedMetric,
    summary: buildSummary(entries),
    self,
    podium,
    leaderboard
  };

  if (role === 'service_rep') {
    response.serviceSecondaryLeaderboard = sortEntries(entries, 'efficiency_rate');
  }

  return response;
};

export const leaderboardToCsv = (rows: LeaderboardEntry[]): string => {
  const headers = [
    'name',
    'role',
    'leads_created',
    'cars_sold',
    'vehicle_value_total',
    'profit_total',
    'services_completed',
    'hours_billed',
    'hours_worked',
    'efficiency_rate'
  ];

  const csvRows = rows.map((row) =>
    [
      row.name,
      row.role,
      row.leadsCreated,
      row.carsSold,
      row.vehicleValueTotal.toFixed(2),
      row.profitTotal.toFixed(2),
      row.servicesCompleted,
      row.hoursBilled.toFixed(2),
      row.hoursWorked.toFixed(2),
      row.efficiencyRate.toFixed(2)
    ]
      .map((field) => `"${String(field).replaceAll('"', '""')}"`)
      .join(',')
  );

  return [headers.join(','), ...csvRows].join('\n');
};
