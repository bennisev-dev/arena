'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Mail, Search, UserCircle2, Cog, LogOut } from 'lucide-react';

interface TopbarProps {
  userName: string;
  roleLabel: string;
}

type DropdownId = 'mail' | 'notifications' | 'profile' | null;

export function Topbar({ userName, roleLabel }: TopbarProps) {
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<DropdownId>(null);
  const mailRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        openDropdown &&
        !mailRef.current?.contains(target) &&
        !notificationsRef.current?.contains(target) &&
        !profileRef.current?.contains(target)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const toggle = (id: DropdownId) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-neutral-200 px-2 pb-4">
      <div className="flex h-11 w-[280px] items-center gap-2 rounded-full border border-neutral-200 bg-white px-4">
        <Search className="h-4 w-4 shrink-0 text-neutral-400" />
        <input
          aria-label="Search"
          placeholder="Search for Query"
          className="w-full border-none bg-transparent text-xs text-neutral-700 outline-none"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={mailRef}>
          <button
            type="button"
            onClick={() => toggle('mail')}
            aria-label="Messages"
            aria-expanded={openDropdown === 'mail'}
            className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100"
          >
            <Mail className="h-4 w-4" />
          </button>
          {openDropdown === 'mail' && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-neutral-200 bg-white py-2 shadow-lg">
              <p className="px-4 py-2 text-xs text-neutral-500">Messages</p>
              <Link
                href="/dashboard/settings"
                onClick={() => setOpenDropdown(null)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-neutral-50"
              >
                <Mail className="h-4 w-4 text-neutral-400" />
                Contact support
              </Link>
            </div>
          )}
        </div>

        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => toggle('notifications')}
            aria-label="Notifications"
            aria-expanded={openDropdown === 'notifications'}
            className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100"
          >
            <Bell className="h-4 w-4" />
          </button>
          {openDropdown === 'notifications' && (
            <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-neutral-200 bg-white py-2 shadow-lg">
              <p className="px-4 py-2 text-xs font-medium text-neutral-600">Notifications</p>
              <div className="max-h-64 overflow-y-auto">
                <div className="px-4 py-6 text-center text-sm text-neutral-500">No new notifications</div>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => toggle('profile')}
            aria-label="Profile menu"
            aria-expanded={openDropdown === 'profile'}
            className="flex items-center gap-3 rounded-full border border-neutral-200 px-3 py-1 text-left transition hover:bg-neutral-50"
          >
            <div className="h-8 w-8 rounded-full bg-neutral-200" />
            <div>
              <p className="text-xs font-semibold text-ink">{userName}</p>
              <p className="text-[10px] uppercase tracking-wide text-neutral-400">{roleLabel}</p>
            </div>
          </button>
          {openDropdown === 'profile' && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-neutral-200 bg-white py-2 shadow-lg">
              <Link
                href="/dashboard/profile"
                onClick={() => setOpenDropdown(null)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-neutral-50"
              >
                <UserCircle2 className="h-4 w-4 text-neutral-400" />
                Profile
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setOpenDropdown(null)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-neutral-50"
              >
                <Cog className="h-4 w-4 text-neutral-400" />
                Settings
              </Link>
              <hr className="my-2 border-neutral-100" />
              <button
                type="button"
                onClick={() => {
                  setOpenDropdown(null);
                  handleLogout();
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
