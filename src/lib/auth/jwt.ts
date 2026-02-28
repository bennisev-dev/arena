import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { env } from '@/lib/env';

export type SessionPayload = JWTPayload & {
  sub: string;
  organizationId: string | null;
  role: 'sales_rep' | 'service_rep' | 'manager' | null;
  dealershipId: string | null;
  onboardingComplete: boolean;
};

const getSecret = (): Uint8Array => {
  return new TextEncoder().encode(env.JWT_SECRET);
};

export const signToken = async (payload: SessionPayload): Promise<string> => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setSubject(payload.sub)
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(getSecret());
};

export const verifyToken = async (token: string): Promise<SessionPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ['HS256']
    });

    return payload as SessionPayload;
  } catch {
    return null;
  }
};
