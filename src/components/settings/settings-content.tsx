'use client';

import { useEffect, useState } from 'react';
import { Bell, Mail, BarChart3, Lock } from 'lucide-react';

const SETTINGS_KEYS = {
  emailDigest: 'arena_settings_email_digest',
  inAppNotifications: 'arena_settings_in_app_notifications',
  defaultMetric: 'arena_settings_default_metric',
  defaultDepartment: 'arena_settings_default_department'
} as const;

const metricOptions = [
  { value: 'leads_created', label: 'Leads created' },
  { value: 'cars_sold', label: 'Cars sold' },
  { value: 'profit_total', label: 'Profit total' },
  { value: 'vehicle_value_total', label: 'Vehicle value total' },
  { value: 'services_completed', label: 'Services completed' },
  { value: 'efficiency_rate', label: 'Efficiency rate' }
];

const departmentOptions = [
  { value: 'all', label: 'All' },
  { value: 'sales', label: 'Sales' },
  { value: 'service', label: 'Service' }
];

interface SettingsContentProps {
  role: 'sales_rep' | 'service_rep' | 'manager';
}

export function SettingsContent({ role }: SettingsContentProps) {
  const [emailDigest, setEmailDigest] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [defaultMetric, setDefaultMetric] = useState('leads_created');
  const [defaultDepartment, setDefaultDepartment] = useState('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(SETTINGS_KEYS.emailDigest);
      if (stored !== null) setEmailDigest(stored === 'true');
    } catch {}
  }, [mounted]);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(SETTINGS_KEYS.inAppNotifications);
      if (stored !== null) setInAppNotifications(stored === 'true');
    } catch {}
  }, [mounted]);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(SETTINGS_KEYS.defaultMetric);
      if (stored) setDefaultMetric(stored);
    } catch {}
  }, [mounted]);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(SETTINGS_KEYS.defaultDepartment);
      if (stored) setDefaultDepartment(stored);
    } catch {}
  }, [mounted]);

  const handleEmailDigest = (checked: boolean) => {
    setEmailDigest(checked);
    try {
      localStorage.setItem(SETTINGS_KEYS.emailDigest, String(checked));
    } catch {}
  };

  const handleInAppNotifications = (checked: boolean) => {
    setInAppNotifications(checked);
    try {
      localStorage.setItem(SETTINGS_KEYS.inAppNotifications, String(checked));
    } catch {}
  };

  const handleDefaultMetric = (value: string) => {
    setDefaultMetric(value);
    try {
      localStorage.setItem(SETTINGS_KEYS.defaultMetric, value);
    } catch {}
  };

  const handleDefaultDepartment = (value: string) => {
    setDefaultDepartment(value);
    try {
      localStorage.setItem(SETTINGS_KEYS.defaultDepartment, value);
    } catch {}
  };

  const isManager = role === 'manager';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (!currentPassword.trim()) {
      setPasswordMessage({ type: 'error', text: 'Enter your current password.' });
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 72) {
      setPasswordMessage({ type: 'error', text: 'New password must be 8–72 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword,
          confirmNewPassword: confirmPassword
        })
      });
      const data = (await res.json()) as { error?: string } | { success?: boolean };
      if (!res.ok) {
        setPasswordMessage({ type: 'error', text: (data as { error?: string }).error ?? 'Failed to change password.' });
        return;
      }
      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPasswordMessage({ type: 'error', text: 'Failed to change password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-ink">Settings</h2>
        <p className="text-xs text-neutral-500">Notifications and dashboard defaults</p>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6">
        <div className="flex items-center gap-3 border-b border-neutral-200 pb-3">
          <Lock className="h-5 w-5 text-neutral-500" />
          <h3 className="text-sm font-semibold text-ink">Change password</h3>
        </div>
        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-xs font-medium text-neutral-600">
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-2 w-full max-w-xs rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-ink/20"
              placeholder="Enter current password"
              disabled={passwordLoading}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-xs font-medium text-neutral-600">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-2 w-full max-w-xs rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-ink/20"
              placeholder="Enter new password"
              disabled={passwordLoading}
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-neutral-500">8–72 characters</p>
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-xs font-medium text-neutral-600">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 w-full max-w-xs rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-ink/20"
              placeholder="Confirm new password"
              disabled={passwordLoading}
              autoComplete="new-password"
            />
          </div>
          {passwordMessage && (
            <p className={passwordMessage.type === 'success' ? 'text-xs text-green-600' : 'text-xs text-red-600'}>
              {passwordMessage.text}
            </p>
          )}
          <button
            type="submit"
            disabled={passwordLoading}
            className="rounded-lg bg-ink px-4 py-2 text-xs font-medium text-white transition hover:bg-ink/90 disabled:opacity-50"
          >
            {passwordLoading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6">
        <div className="flex items-center gap-3 border-b border-neutral-200 pb-3">
          <Bell className="h-5 w-5 text-neutral-500" />
          <h3 className="text-sm font-semibold text-ink">Notifications</h3>
        </div>
        <div className="mt-4 space-y-4">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span className="text-sm text-ink">Email digest</span>
            <input
              type="checkbox"
              checked={emailDigest}
              onChange={(e) => handleEmailDigest(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-ink focus:ring-ink"
            />
          </label>
          <p className="text-xs text-neutral-500">Receive a weekly summary of your performance and leaderboard position.</p>

          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span className="text-sm text-ink">In-app notifications</span>
            <input
              type="checkbox"
              checked={inAppNotifications}
              onChange={(e) => handleInAppNotifications(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-ink focus:ring-ink"
            />
          </label>
          <p className="text-xs text-neutral-500">Show notifications in the app when rankings or goals change.</p>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6">
        <div className="flex items-center gap-3 border-b border-neutral-200 pb-3">
          <BarChart3 className="h-5 w-5 text-neutral-500" />
          <h3 className="text-sm font-semibold text-ink">Dashboard defaults</h3>
        </div>
        <p className="mt-3 text-xs text-neutral-500">These are used when you open the dashboard. Changes apply on next visit.</p>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="settings-metric" className="block text-xs font-medium text-neutral-600">
              Default leaderboard metric
            </label>
            <select
              id="settings-metric"
              value={defaultMetric}
              onChange={(e) => handleDefaultMetric(e.target.value)}
              className="mt-2 w-full max-w-xs rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-ink/20"
            >
              {metricOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {isManager && (
            <div>
              <label htmlFor="settings-department" className="block text-xs font-medium text-neutral-600">
                Default department view
              </label>
              <select
                id="settings-department"
                value={defaultDepartment}
                onChange={(e) => handleDefaultDepartment(e.target.value)}
                className="mt-2 w-full max-w-xs rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-ink/20"
              >
                {departmentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6">
        <div className="flex items-center gap-3 border-b border-neutral-200 pb-3">
          <Mail className="h-5 w-5 text-neutral-500" />
          <h3 className="text-sm font-semibold text-ink">Support</h3>
        </div>
        <p className="mt-3 text-sm text-neutral-600">Contact Arena Support for help with your account or the leaderboard.</p>
        <div className="mt-3 rounded-xl border border-dashed border-neutral-300 p-3 text-xs text-neutral-500">
          Arena Support
        </div>
      </section>
    </div>
  );
}
