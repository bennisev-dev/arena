import { NextResponse } from 'next/server';

export const ok = <T>(data: T, status = 200): NextResponse<T> => {
  return NextResponse.json(data, { status });
};

export const fail = (message: string, status = 400): NextResponse<{ error: string }> => {
  return NextResponse.json({ error: message }, { status });
};
