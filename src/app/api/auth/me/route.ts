import { fail, ok } from '@/lib/api/response';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth/session';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return fail('Unauthorized.', 401);
  }

  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      dealership_id: true,
      external_user_id: true,
      crm_source: true,
      onboarding_complete: true
    }
  });

  if (!user) {
    return fail('Unauthorized.', 401);
  }

  return ok({ user });
}
