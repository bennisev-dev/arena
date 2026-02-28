import type { User } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

const signupSchema = z
  .object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword']
  });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72)
});

export type AuthUser = Pick<
  User,
  'id' | 'name' | 'email' | 'role' | 'organization_id' | 'dealership_id' | 'onboarding_complete'
>;

const sanitizeUser = (user: User): AuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  organization_id: user.organization_id,
  dealership_id: user.dealership_id,
  onboarding_complete: user.onboarding_complete
});

export const signup = async (input: unknown): Promise<AuthUser> => {
  const data = signupSchema.parse(input);

  const defaultOrg = await db.organization.findFirst({ orderBy: { created_at: 'asc' } });
  const organizationId = defaultOrg?.id ?? null;
  if (!organizationId) {
    throw new Error('No organization available. Please run migrations and seed.');
  }

  try {
    const user = await db.user.create({
      data: {
        organization_id: organizationId,
        name: data.name,
        email: data.email.toLowerCase(),
        password_hash: await hashPassword(data.password),
        onboarding_complete: false
      }
    });

    return sanitizeUser(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('EMAIL_IN_USE');
    }
    throw error;
  }
};

export const login = async (input: unknown): Promise<AuthUser> => {
  const data = loginSchema.parse(input);

  const user = await db.user.findFirst({
    where: { email: data.email.toLowerCase() }
  });

  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const validPassword = await verifyPassword(data.password, user.password_hash);

  if (!validPassword) {
    throw new Error('INVALID_CREDENTIALS');
  }

  return sanitizeUser(user);
};
