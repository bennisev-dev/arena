'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import type { DashboardDepartment, LeaderboardMetric, LeaderboardResponse } from '@/types/domain';
import { currency, number, percentage } from '@/lib/utils';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { StatCard } from '@/components/dashboard/stat-card';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { StatusCard } from '@/components/dashboard/status-card';
import { LeaderboardTable } from '@/components/dashboard/leaderboard-table';

interface DashboardClientProps {
  role: 'sales_rep' | 'service_rep' | 'manager';
  userName: string;
}

const metricOptions: Record<'sales_rep' | 'service_rep' | 'manager', LeaderboardMetric[]> = {
  sales_rep: ['leads_created', 'cars_sold', 'profit_total', 'vehicle_value_total'],
  service_rep: ['services_completed', 'efficiency_rate', 'profit_total'],
  manager: ['leads_created', 'cars_sold', 'profit_total', 'vehicle_value_total', 'services_completed', 'efficiency_rate']
};

const defaultMetric: Record<'sales_rep' | 'service_rep' | 'manager', LeaderboardMetric> = {
  sales_rep: 'leads_created',
  service_rep: 'services_completed',
  manager: 'leads_created'
};

const roleLabel: Record<'sales_rep' | 'service_rep' | 'manager', string> = {
  sales_rep: 'Sales Rep',
  service_rep: 'Service Rep',
  manager: 'Manager'
};

export function DashboardClient({ role, userName }: DashboardClientProps) {
  const [metric, setMetric] = useState<LeaderboardMetric>(defaultMetric[role]);
  const [department, setDepartment] = useState<DashboardDepartment>(role === 'manager' ? 'all' : role === 'sales_rep' ? 'sales' : 'service');
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `/api/leaderboard?metric=${metric}&department=${department}`;
        const response = await fetch(url, { cache: 'no-store' });
        const payload = (await response.json()) as LeaderboardResponse & { error?: string };

        if (!response.ok) {
          setError(payload.error ?? 'Failed to fetch leaderboard.');
          return;
        }

        setData(payload);
      } catch {
        setError('Failed to fetch leaderboard.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [metric, department]);

  const rows = useMemo(() => {
    if (!data) return [];
    return [...data.podium, ...data.leaderboard];
  }, [data]);

  const chartValues = useMemo(() => rows.slice(0, 12).map((row) => row.sortValue || 0), [rows]);

  const cards = useMemo(() => {
    if (!data) return [];

    if (role === 'sales_rep') {
      return [
        { label: 'Leads', value: number(data.summary.totalLeadsCreated), change: 'Current month total' },
        { label: 'Homes Sold', value: number(data.summary.totalCarsSold), change: 'Current month total' },
        { label: 'Total Profit', value: currency(data.summary.totalProfit), change: `Month ${data.month}/${data.year}` },
        { label: 'Volume', value: currency(data.summary.totalVehicleValue), change: 'Current month total' },
        {
          label: 'Avg Gross / Sale',
          value: currency(data.summary.totalCarsSold ? data.summary.totalProfit / data.summary.totalCarsSold : 0),
          change: 'Computed from monthly totals'
        },
        { label: 'Your Rank', value: data.self ? String(rows.findIndex((row) => row.userId === data.self?.userId) + 1) : '-', change: 'Current leaderboard' }
      ];
    }

    if (role === 'service_rep') {
      return [
        { label: 'Total Profit', value: currency(data.summary.totalProfit), change: `Month ${data.month}/${data.year}` },
        { label: 'Services Completed', value: number(data.summary.totalServicesCompleted), change: 'Current month total' },
        { label: 'Avg Efficiency', value: percentage(data.summary.avgEfficiencyRate), change: 'Calculated (hours billed / worked)' },
        { label: 'Hours Billed', value: number(rows.reduce((sum, row) => sum + row.hoursBilled, 0)), change: 'Current month total' },
        { label: 'Hours Worked', value: number(rows.reduce((sum, row) => sum + row.hoursWorked, 0)), change: 'Current month total' }
      ];
    }

    return [
      { label: 'Leads', value: number(data.summary.totalLeadsCreated), change: 'Current month total' },
      { label: 'Homes Sold', value: number(data.summary.totalCarsSold), change: 'Current month total' },
      { label: 'Aggregate Profit', value: currency(data.summary.totalProfit), change: `Month ${data.month}/${data.year}` },
      { label: 'Volume', value: currency(data.summary.totalVehicleValue), change: 'Current month total' },
      { label: 'Services', value: number(data.summary.totalServicesCompleted), change: 'Current month total' },
      { label: 'Avg Efficiency', value: percentage(data.summary.avgEfficiencyRate), change: 'Calculated across reps' }
    ];
  }, [data, role, rows]);

  return (
    <div className="min-h-screen bg-[#E9E9E9] p-6 lg:p-10">
      <div className="mx-auto max-w-[1320px] rounded-[28px] bg-[#F4F4F4] p-4 shadow-panel lg:p-6">
        <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <Sidebar />

          <main className="space-y-5 rounded-2xl bg-white p-5">
            <Topbar userName={userName} roleLabel={roleLabel[role]} />

            <section className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-ink">Overview</h2>
                <p className="text-xs text-neutral-500">Monthly leaderboard performance</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {role === 'manager' && (
                  <select
                    className="rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs"
                    value={department}
                    onChange={(event) => setDepartment(event.target.value as DashboardDepartment)}
                  >
                    <option value="all">All</option>
                    <option value="sales">Sales</option>
                    <option value="service">Service</option>
                  </select>
                )}

                <select
                  className="rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs"
                  value={metric}
                  onChange={(event) => setMetric(event.target.value as LeaderboardMetric)}
                >
                  {metricOptions[role].map((option) => (
                    <option key={option} value={option}>
                      {option.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>

                {role === 'manager' && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-2 text-xs font-medium text-white"
                    onClick={() => {
                      window.location.href = `/api/leaderboard/export?metric=${metric}&department=${department}`;
                    }}
                  >
                    <Download className="h-3.5 w-3.5" /> Export CSV
                  </button>
                )}
              </div>
            </section>

            {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

            <section className="grid gap-3 lg:grid-cols-5">
              {cards.map((card, index) => (
                <StatCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  change={card.change}
                  emphasized={index === 1}
                />
              ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <OverviewChart values={chartValues} />
              <StatusCard
                primaryValue={number(data?.summary.totalServicesCompleted ?? 0)}
                secondaryValue={number(data?.summary.totalCarsSold ?? 0)}
                primaryLabel={role === 'service_rep' ? 'Services Completed' : 'Approved'}
                secondaryLabel={role === 'service_rep' ? 'Homes Sold' : 'Under Review'}
              />
            </section>

            <section className="grid gap-3 lg:grid-cols-3">
              {data?.podium.length ? (
                data.podium.map((entry, index) => (
                  <article key={entry.userId} className="rounded-xl border border-neutral-200 bg-white p-4">
                    <p className="text-xs text-neutral-500">Podium #{index + 1}</p>
                    <p className="mt-2 text-lg font-semibold text-ink">{entry.name}</p>
                    <p className="mt-1 text-xs text-neutral-500 capitalize">{entry.role.replace('_', ' ')}</p>
                    <p className="mt-3 text-sm font-medium text-ink">Score {number(entry.sortValue)}</p>
                  </article>
                ))
              ) : (
                <article className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
                  No podium entries yet for this month.
                </article>
              )}
            </section>

            <LeaderboardTable rows={rows} metric={data?.metric ?? metric} />

            {role === 'service_rep' && data?.serviceSecondaryLeaderboard ? (
              <LeaderboardTable rows={data.serviceSecondaryLeaderboard} metric="efficiency_rate" />
            ) : null}

            {loading ? <p className="text-xs text-neutral-400">Loading latest performance...</p> : null}
          </main>
        </div>
      </div>
    </div>
  );
}
