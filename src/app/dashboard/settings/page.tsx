import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/auth/session';
import { SettingsContent } from '@/components/settings/settings-content';

export default async function SettingsPage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect('/login');
  }

  if (!session.onboardingComplete || !session.role) {
    redirect('/onboarding');
  }

  return <SettingsContent role={session.role} />;
}
