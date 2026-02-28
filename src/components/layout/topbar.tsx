'use client';

import { Bell, Mail, Search } from 'lucide-react';

interface TopbarProps {
  userName: string;
  roleLabel: string;
}

export function Topbar({ userName, roleLabel }: TopbarProps) {
  return (
    <header className="flex items-center justify-between border-b border-neutral-200 px-2 pb-4">
      <div className="flex h-11 w-[280px] items-center gap-2 rounded-full border border-neutral-200 bg-white px-4">
        <Search className="h-4 w-4 text-neutral-400" />
        <input
          aria-label="Search"
          placeholder="Search for Query"
          className="w-full border-none bg-transparent text-xs text-neutral-700 outline-none"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100" type="button" aria-label="Mail">
          <Mail className="h-4 w-4" />
        </button>
        <button
          className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100"
          type="button"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 rounded-full border border-neutral-200 px-3 py-1">
          <div className="h-8 w-8 rounded-full bg-neutral-200" />
          <div>
            <p className="text-xs font-semibold text-ink">{userName}</p>
            <p className="text-[10px] uppercase tracking-wide text-neutral-400">{roleLabel}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
