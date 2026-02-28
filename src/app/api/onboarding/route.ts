import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fail } from '@/lib/api/response';
import { requireSession } from '@/lib/auth/guard';
import { completeOnboarding } from '@/services/onboarding.service';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import type { SessionPayload } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const body = await request.json();

    const updated = await completeOnboarding(session.sub, body);

    const payload: SessionPayload = {
      sub: session.sub,
      role: updated.role,
      dealershipId: updated.dealership_id,
      onboardingComplete: updated.onboarding_complete
    };

    const token = await createSessionToken(payload);

    const response = NextResponse.json({
      success: true,
      nextPath: '/dashboard'
    });

    setSessionCookie(response, token);

    return response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return fail('Unauthorized.', 401);
      }
      if (error.message === 'EXTERNAL_USER_ALREADY_MAPPED') {
        return fail('This external user is already mapped for the dealership.', 409);
      }
    }

    return fail('Unable to complete onboarding.', 400);
  }
}
