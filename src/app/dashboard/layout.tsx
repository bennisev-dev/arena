import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth/session';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect('/login');
  }

  if (!session.onboardingComplete || !session.role) {
    redirect('/onboarding');
  }

  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: { name: true }
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardShell userName={user.name} role={session.role}>
      {children}
    </DashboardShell>
  );
}
