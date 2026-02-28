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

export async function PATCH(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return fail('Unauthorized.', 401);
  }

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return fail('Invalid JSON.', 400);
  }

  const name = typeof body.name === 'string' ? body.name.trim() : undefined;
  if (name !== undefined && name.length === 0) {
    return fail('Name cannot be empty.', 400);
  }

  if (name === undefined) {
    return fail('No updates provided.', 400);
  }

  const user = await db.user.update({
    where: { id: session.sub },
    data: { name },
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

  return ok({ user });
}
