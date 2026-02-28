interface StatusCardProps {
  primaryValue: string;
  secondaryValue: string;
  primaryLabel: string;
  secondaryLabel: string;
}

export function StatusCard({ primaryValue, secondaryValue, primaryLabel, secondaryLabel }: StatusCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Today&apos;s Status</h3>
        <span className="text-xs text-neutral-500">15 Days</span>
      </div>

      <div className="relative mx-auto mb-6 h-[180px] w-[180px]">
        <div className="absolute left-1/2 top-1/2 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rotate-12 bg-neutral-300 [clip-path:polygon(50%_0%,100%_40%,85%_100%,20%_95%,0%_35%)]" />
        <div className="absolute left-1/2 top-1/2 h-[128px] w-[128px] -translate-x-1/2 -translate-y-1/2 -rotate-12 bg-neutral-900 text-white [clip-path:polygon(50%_0%,100%_40%,82%_100%,18%_92%,0%_35%)]">
          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{primaryValue}</div>
        </div>
        {[14, 42, 71, 101, 130, 158].map((offset) => (
          <span
            key={offset}
            className="absolute h-1.5 w-1.5 rounded-full bg-neutral-900"
            style={{ left: `${offset}px`, top: `${offset % 2 === 0 ? 16 : 152}px` }}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-neutral-100 px-3 py-2">
          <p className="text-lg font-semibold text-ink">{primaryValue}</p>
          <p className="text-neutral-500">{primaryLabel}</p>
        </div>
        <div className="rounded-lg bg-neutral-100 px-3 py-2">
          <p className="text-lg font-semibold text-ink">{secondaryValue}</p>
          <p className="text-neutral-500">{secondaryLabel}</p>
        </div>
      </div>
    </div>
  );
}
