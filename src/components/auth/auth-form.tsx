'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(mode === 'signup' ? { name, confirmPassword } : {}),
          email,
          password
        })
      });

      const payload = (await response.json()) as { error?: string; nextPath?: string };

      if (!response.ok) {
        setError(payload.error ?? 'Authentication failed.');
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
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-panel">
      <h1 className="text-3xl font-semibold text-ink">{mode === 'login' ? 'Welcome back' : 'Create Arena account'}</h1>
      <p className="mt-2 text-sm text-muted">
        {mode === 'login' ? 'Sign in to access your dealership leaderboard.' : 'Set up credentials to begin onboarding.'}
      </p>

      <form className="mt-8 space-y-4" onSubmit={submit}>
        {mode === 'signup' && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">Full name</span>
            <input
              required
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-400"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Email</span>
          <input
            required
            type="email"
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-400"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Password</span>
          <input
            required
            minLength={8}
            type="password"
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-400"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {mode === 'signup' && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">Confirm password</span>
            <input
              required
              minLength={8}
              type="password"
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-400"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
        )}

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-70"
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
