import type { NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { fail, ok } from '@/lib/api/response';
import { db } from '@/lib/db';
import { ingestPayload } from '@/services/ingestion.service';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret');
  if (!env.FORTELLIS_WEBHOOK_SECRET || secret !== env.FORTELLIS_WEBHOOK_SECRET) {
    return fail('Invalid webhook secret.', 401);
  }

  const defaultOrg = await db.organization.findFirst({ orderBy: { created_at: 'asc' } });
  if (!defaultOrg) {
    return fail('No organization configured.', 503);
  }

  try {
    const payload = await request.json();
    const result = await ingestPayload('fortellis', payload, defaultOrg.id);
    return ok(result);
  } catch {
    return fail('Unable to process webhook payload.', 400);
  }
}
