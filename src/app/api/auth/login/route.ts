import { NextResponse } from 'next/server';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { fail } from '@/lib/api/response';
import { login } from '@/services/auth.service';
import { buildSessionPayload } from '@/services/session.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await login(body);

    const token = await createSessionToken(buildSessionPayload(user));
    const response = NextResponse.json({
      user,
      nextPath: user.onboarding_complete ? '/dashboard' : '/onboarding'
    });

    setSessionCookie(response, token);

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
      return fail('Invalid email or password.', 401);
    }

    return fail('Unable to log in.', 400);
  }
}
