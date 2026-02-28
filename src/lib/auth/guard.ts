import type { NextRequest } from 'next/server';
import type { Role } from '@prisma/client';
import { getSessionFromRequest } from '@/lib/auth/session';

export const requireSession = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);

  if (!session) {
    throw new Error('UNAUTHORIZED');
  }

  return session;
};

export const requireRole = async (request: NextRequest, allowedRoles: Role[]) => {
  const session = await requireSession(request);

  if (!session.role || !allowedRoles.includes(session.role)) {
    throw new Error('FORBIDDEN');
  }

  return session;
};
