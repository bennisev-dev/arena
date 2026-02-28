import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api/response';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth/session';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

const MIN_LENGTH = 8;
const MAX_LENGTH = 72;

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return fail('Unauthorized.', 401);
  }

  let body: { currentPassword?: string; newPassword?: string; confirmNewPassword?: string };
  try {
    body = await request.json();
  } catch {
    return fail('Invalid JSON.', 400);
  }

  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword.trim() : '';
  const confirmNewPassword = typeof body.confirmNewPassword === 'string' ? body.confirmNewPassword : '';

  if (!currentPassword) {
    return fail('Current password is required.', 400);
  }

  if (newPassword.length < MIN_LENGTH || newPassword.length > MAX_LENGTH) {
    return fail(`New password must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters.`, 400);
  }

  if (newPassword !== confirmNewPassword) {
    return fail('New password and confirmation do not match.', 400);
  }

  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: { password_hash: true }
  });

  if (!user) {
    return fail('Unauthorized.', 401);
  }

  const validCurrent = await verifyPassword(currentPassword, user.password_hash);
  if (!validCurrent) {
    return fail('Current password is incorrect.', 401);
  }

  const password_hash = await hashPassword(newPassword);
  await db.user.update({
    where: { id: session.sub },
    data: { password_hash }
  });

  return ok({ success: true });
}
