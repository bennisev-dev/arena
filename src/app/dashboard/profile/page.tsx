import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/auth/session';
import { ProfileContent } from '@/components/profile/profile-content';

export default async function ProfilePage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect('/login');
  }

  if (!session.onboardingComplete || !session.role) {
    redirect('/onboarding');
  }

  return <ProfileContent />;
}
