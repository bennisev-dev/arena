import type { LeaderboardEntry, LeaderboardMetric } from '@/types/domain';
import { currency, number, percentage } from '@/lib/utils';

interface LeaderboardTableProps {
  rows: LeaderboardEntry[];
  metric: LeaderboardMetric;
}

const metricLabel: Record<LeaderboardMetric, string> = {
  leads_created: 'Leads',
  cars_sold: 'Homes Sold',
  profit_total: 'Profit',
  vehicle_value_total: 'Volume',
  services_completed: 'Services',
  efficiency_rate: 'Efficiency'
};

const metricValue = (row: LeaderboardEntry, metric: LeaderboardMetric): string => {
  if (metric === 'leads_created') return number(row.leadsCreated);
  if (metric === 'cars_sold') return number(row.carsSold);
  if (metric === 'profit_total') return currency(row.profitTotal);
  if (metric === 'vehicle_value_total') return currency(row.vehicleValueTotal);
  if (metric === 'services_completed') return number(row.servicesCompleted);
  return percentage(row.efficiencyRate);
};

export function LeaderboardTable({ rows, metric }: LeaderboardTableProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Leaderboard</h3>
        <span className="text-xs text-neutral-500">Sorted by {metricLabel[metric]}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-500">
              <th className="px-2 py-2 font-medium">Rank</th>
              <th className="px-2 py-2 font-medium">Rep</th>
              <th className="px-2 py-2 font-medium">Role</th>
              <th className="px-2 py-2 font-medium">{metricLabel[metric]}</th>
              <th className="px-2 py-2 font-medium">Leads</th>
              <th className="px-2 py-2 font-medium">Profit</th>
              <th className="px-2 py-2 font-medium">Homes</th>
              <th className="px-2 py-2 font-medium">Services</th>
              <th className="px-2 py-2 font-medium">Efficiency</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-2 py-4 text-center text-neutral-400">
                  No performance data for this month.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.userId} className="border-b border-neutral-100 last:border-b-0">
                  <td className="px-2 py-3 font-semibold text-ink">#{index + 1}</td>
                  <td className="px-2 py-3 text-ink">{row.name}</td>
                  <td className="px-2 py-3 text-neutral-500">{row.role.replace('_', ' ')}</td>
                  <td className="px-2 py-3 font-medium text-ink">{metricValue(row, metric)}</td>
                  <td className="px-2 py-3 text-neutral-600">{number(row.leadsCreated)}</td>
                  <td className="px-2 py-3 text-neutral-600">{currency(row.profitTotal)}</td>
                  <td className="px-2 py-3 text-neutral-600">{number(row.carsSold)}</td>
                  <td className="px-2 py-3 text-neutral-600">{number(row.servicesCompleted)}</td>
                  <td className="px-2 py-3 text-neutral-600">{percentage(row.efficiencyRate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
