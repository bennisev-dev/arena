import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { fail } from '@/lib/api/response';
import { signup } from '@/services/auth.service';
import { buildSessionPayload } from '@/services/session.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await signup(body);

    const token = await createSessionToken(buildSessionPayload(user));
    const response = NextResponse.json({
      user,
      nextPath: user.onboarding_complete ? '/dashboard' : '/onboarding'
    });

    setSessionCookie(response, token);

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_IN_USE') {
      return fail('Email is already registered.', 409);
    }
    if (error instanceof ZodError) {
      const msg = error.errors[0]?.message ?? 'Invalid signup data.';
      return fail(msg, 400);
    }

    return fail('Unable to sign up.', 400);
  }
}
