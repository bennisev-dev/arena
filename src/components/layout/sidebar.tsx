'use client';

import Link from 'next/link';
import { Cog, Home, UserCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems: { label: string; href: string; icon: typeof Home }[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Profile', href: '/dashboard/profile', icon: UserCircle2 },
  { label: 'Settings', href: '/dashboard/settings', icon: Cog }
];

interface SidebarProps {
  pathname: string;
}

export function Sidebar({ pathname }: SidebarProps) {
  return (
    <aside className="flex h-full w-[220px] flex-col rounded-2xl bg-white p-4">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-sm font-medium transition',
                active ? 'bg-ink text-white' : 'text-neutral-600 hover:bg-neutral-100'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl bg-neutral-100 p-4">
        <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white">→</div>
        <p className="text-sm font-medium text-neutral-700">Our team will help you dominate this month.</p>
        <div className="mt-4 rounded-xl border border-dashed border-neutral-300 p-3 text-xs text-neutral-500">Arena Support</div>
      </div>
    </aside>
  );
}
