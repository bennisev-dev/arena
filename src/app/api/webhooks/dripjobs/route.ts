import type { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api/response';
import { db } from '@/lib/db';
import { ingestPayload } from '@/services/ingestion.service';

export async function POST(request: NextRequest) {
  try {
    const webhookSecret =
      request.headers.get('x-webhook-secret') ?? request.nextUrl.searchParams.get('secret');
    if (!webhookSecret) {
      return fail('Missing webhook secret (x-webhook-secret or query param secret).', 401);
    }

    const webhook = await db.crmWebhook.findFirst({
      where: { webhook_secret: webhookSecret, is_active: true },
      select: { id: true, organization_id: true }
    });

    if (!webhook) {
      return fail('Invalid webhook secret.', 401);
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return fail('Invalid JSON body.', 400);
    }

    const result = await ingestPayload('dripjobs', payload, webhook.organization_id);

    await db.crmWebhook.update({
      where: { id: webhook.id },
      data: {
        last_used_at: new Date(),
        request_count: { increment: 1 }
      }
    });

    return ok(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error processing webhook.';
    const isPayloadError =
      /payload|record|dealership_id|external_user_id|JSON/i.test(message);
    return fail(message, isPayloadError ? 400 : 500);
  }
}
