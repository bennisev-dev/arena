import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  emphasized?: boolean;
}

export function StatCard({ label, value, change, emphasized = false }: StatCardProps) {
  return (
    <article
      className={cn(
        'rounded-xl border px-4 py-5',
        emphasized ? 'border-ink bg-ink text-white' : 'border-neutral-200 bg-white text-ink'
      )}
    >
      <p className={cn('text-xs', emphasized ? 'text-neutral-300' : 'text-neutral-500')}>{label}</p>
      <p className="mt-3 text-4xl font-semibold leading-none">{value}</p>
      <p className={cn('mt-3 text-xs font-medium', emphasized ? 'text-neutral-200' : 'text-neutral-600')}>{change}</p>
    </article>
  );
}
