import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { getSessionFromCookies } from '@/lib/auth/session';

export default async function SignupPage() {
  const session = await getSessionFromCookies();

  if (session) {
    redirect(session.onboardingComplete ? '/dashboard' : '/onboarding');
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="space-y-4">
        <AuthForm mode="signup" />
        <p className="text-center text-sm text-neutral-600">
          Have an account?{' '}
          <Link className="font-semibold text-ink underline" href="/login">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
