import type { NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { fail, ok } from '@/lib/api/response';
import { ingestPayload } from '@/services/ingestion.service';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret');
  if (secret !== env.DRIPJOBS_WEBHOOK_SECRET) {
    return fail('Invalid webhook secret.', 401);
  }

  try {
    const payload = await request.json();
    const result = await ingestPayload('dripjobs', payload);
    return ok(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to process webhook payload.';
    return fail(message, 400);
  }
}
