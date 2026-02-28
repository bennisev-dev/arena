'use client';

import { useEffect, useState } from 'react';
import { UserCircle2 } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string | null;
  dealership_id: string | null;
  external_user_id: string | null;
  crm_source: string | null;
  onboarding_complete: boolean;
}

export function ProfileContent() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'Failed to load profile.');
          return;
        }
        setUser(data.user);
        setEditName(data.user.name ?? '');
      } catch {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || saving) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveMessage('error');
        return;
      }
      setUser(data.user);
      setSaveMessage('success');
    } catch {
      setSaveMessage('error');
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = (role: string | null) => {
    if (!role) return '—';
    return role.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-ink">Profile</h2>
          <p className="text-xs text-neutral-500">Your account details</p>
        </div>
        <p className="text-sm text-neutral-500">Loading...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-ink">Profile</h2>
          <p className="text-xs text-neutral-500">Your account details</p>
        </div>
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error ?? 'User not found.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-ink">Profile</h2>
        <p className="text-xs text-neutral-500">Your account details and preferences</p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-white">
            <UserCircle2 className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-neutral-500">Name</label>
                <p className="mt-1 text-sm font-medium text-ink">{user.name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500">Email</label>
                <p className="mt-1 text-sm font-medium text-ink">{user.email}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500">Role</label>
                <p className="mt-1 text-sm font-medium text-ink capitalize">{roleLabel(user.role)}</p>
              </div>
              {user.dealership_id ? (
                <div>
                  <label className="block text-xs font-medium text-neutral-500">Dealership ID</label>
                  <p className="mt-1 truncate text-sm text-ink">{user.dealership_id}</p>
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSaveName} className="space-y-3 border-t border-neutral-200 pt-4">
              <label htmlFor="profile-name" className="block text-xs font-medium text-neutral-600">
                Update display name
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id="profile-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-ink/20"
                  placeholder="Your name"
                  disabled={saving}
                />
                <button
                  type="submit"
                  disabled={saving || editName.trim() === user.name}
                  className="rounded-lg bg-ink px-4 py-2 text-xs font-medium text-white transition hover:bg-ink/90 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
              {saveMessage === 'success' && (
                <p className="text-xs text-green-600">Name updated successfully.</p>
              )}
              {saveMessage === 'error' && (
                <p className="text-xs text-red-600">Failed to update name. Try again.</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
