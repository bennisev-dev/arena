import { redirect } from 'next/navigation';
import { OnboardingForm } from '@/components/auth/onboarding-form';
import { getSessionFromCookies } from '@/lib/auth/session';

export default async function OnboardingPage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect('/login');
  }

  if (session.onboardingComplete) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <OnboardingForm />
    </main>
  );
}
