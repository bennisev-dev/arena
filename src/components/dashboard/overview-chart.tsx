interface OverviewChartProps {
  values: number[];
}

export function OverviewChart({ values }: OverviewChartProps) {
  const normalized = values.length ? values : [0, 0, 0, 0, 0, 0, 0, 0];
  const maxValue = Math.max(...normalized, 1);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">Quotation Overview</h3>
          <p className="text-xs text-neutral-500">Current month performance trend</p>
        </div>
        <span className="text-xs text-neutral-500">15 Days</span>
      </div>

      <div className="flex h-[180px] items-end gap-2">
        {normalized.map((value, index) => {
          const height = `${Math.max((value / maxValue) * 100, 6)}%`;
          const dark = index % 2 === 0;

          return (
            <div key={`${value}-${index}`} className="flex flex-1 items-end justify-center">
              <div className={`w-full rounded-sm ${dark ? 'bg-neutral-900' : 'bg-neutral-400'}`} style={{ height }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
