import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { signToken, type SessionPayload, verifyToken } from '@/lib/auth/jwt';
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  domain: env.COOKIE_DOMAIN || undefined
};

export const createSessionToken = async (payload: SessionPayload): Promise<string> => {
  return signToken(payload);
};

export const setSessionCookie = (response: NextResponse, token: string): void => {
  response.cookies.set(AUTH_COOKIE_NAME, token, cookieOptions);
};

export const clearSessionCookie = (response: NextResponse): void => {
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    ...cookieOptions,
    maxAge: 0
  });
};

export const getSessionFromRequest = async (request: NextRequest): Promise<SessionPayload | null> => {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
};

export const getSessionFromCookies = async (): Promise<SessionPayload | null> => {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
};
