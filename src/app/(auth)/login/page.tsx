import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { getSessionFromCookies } from '@/lib/auth/session';

export default async function LoginPage() {
  const session = await getSessionFromCookies();

  if (session) {
    redirect(session.onboardingComplete ? '/dashboard' : '/onboarding');
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="space-y-4">
        <AuthForm mode="login" />
        <p className="text-center text-sm text-neutral-600">
          No account?{' '}
          <Link className="font-semibold text-ink underline" href="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
