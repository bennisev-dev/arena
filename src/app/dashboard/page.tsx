import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth/session';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export default async function DashboardPage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect('/login');
  }

  if (!session.onboardingComplete || !session.role) {
    redirect('/onboarding');
  }

  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: {
      name: true
    }
  });

  if (!user) {
    redirect('/login');
  }

  return <DashboardClient role={session.role} userName={user.name} />;
}
