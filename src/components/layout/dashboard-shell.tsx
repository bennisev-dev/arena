'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

const roleLabel: Record<'sales_rep' | 'service_rep' | 'manager', string> = {
  sales_rep: 'Sales Rep',
  service_rep: 'Service Rep',
  manager: 'Manager'
};

interface DashboardShellProps {
  userName: string;
  role: 'sales_rep' | 'service_rep' | 'manager';
  children: React.ReactNode;
}

export function DashboardShell({ userName, role, children }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#E9E9E9] p-6 lg:p-10">
      <div className="mx-auto max-w-[1320px] rounded-[28px] bg-[#F4F4F4] p-4 shadow-panel lg:p-6">
        <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <Sidebar pathname={pathname ?? ''} />
          <main className="space-y-5 rounded-2xl bg-white p-5">
            <DashboardTopbar userName={userName} role={role} />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export function DashboardTopbar({ userName, role }: { userName: string; role: 'sales_rep' | 'service_rep' | 'manager' }) {
  return <Topbar userName={userName} roleLabel={roleLabel[role]} />;
}
