'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function OnboardingForm() {
  const router = useRouter();
  const [role, setRole] = useState<'sales_rep' | 'service_rep' | 'manager'>('sales_rep');
  const [dealershipId, setDealershipId] = useState('');
  const [crmSource, setCrmSource] = useState<'elead' | 'fortellis' | 'xtime' | 'dripjobs'>('dripjobs');
  const [externalUserId, setExternalUserId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          dealershipId,
          crmSource,
          externalUserId
        })
      });

      const payload = (await response.json()) as { error?: string; nextPath?: string };

      if (!response.ok) {
        setError(payload.error ?? 'Unable to complete onboarding.');
        return;
      }

      router.push(payload.nextPath ?? '/dashboard');
      router.refresh();
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-panel">
      <h1 className="text-3xl font-semibold text-ink">Complete onboarding</h1>
      <p className="mt-2 text-sm text-muted">Select your role and connect your dealership data source.</p>

      <form className="mt-8 grid gap-4" onSubmit={submit}>
        <label className="grid gap-1">
          <span className="text-sm font-medium">Role</span>
          <select
            className="rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            value={role}
            onChange={(event) => setRole(event.target.value as 'sales_rep' | 'service_rep' | 'manager')}
          >
            <option value="sales_rep">Sales Rep</option>
            <option value="service_rep">Service Rep</option>
            <option value="manager">Manager</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Dealership ID</span>
          <input
            required
            className="rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            value={dealershipId}
            onChange={(event) => setDealershipId(event.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">CRM Source</span>
          <select
            className="rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            value={crmSource}
            onChange={(event) => setCrmSource(event.target.value as 'elead' | 'fortellis' | 'xtime' | 'dripjobs')}
          >
            <option value="elead">Elead</option>
            <option value="fortellis">Fortellis</option>
            <option value="xtime">Xtime</option>
            <option value="dripjobs">DripJobs</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">External User ID</span>
          <input
            required
            className="rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            value={externalUserId}
            onChange={(event) => setExternalUserId(event.target.value)}
          />
        </label>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-70"
        >
          {loading ? 'Saving...' : 'Finish setup'}
        </button>
      </form>
    </div>
  );
}
