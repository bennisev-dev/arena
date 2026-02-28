import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api/response';
import { requireSession } from '@/lib/auth/guard';
import { getLeaderboard } from '@/services/leaderboard.service';

const querySchema = z.object({
  metric: z
    .enum(['leads_created', 'cars_sold', 'profit_total', 'vehicle_value_total', 'services_completed', 'efficiency_rate'])
    .default('leads_created'),
  department: z.enum(['sales', 'service', 'all']).default('all')
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);

    if (!session.onboardingComplete || !session.role || !session.dealershipId) {
      return fail('Onboarding incomplete.', 403);
    }

    const { searchParams } = request.nextUrl;
    const query = querySchema.parse({
      metric: searchParams.get('metric') ?? undefined,
      department: searchParams.get('department') ?? undefined
    });

    const data = await getLeaderboard({
      viewerUserId: session.sub,
      organizationId: session.organizationId ?? null,
      role: session.role,
      dealershipId: session.dealershipId,
      metric: query.metric,
      department: query.department
    });

    return ok(data);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return fail('Unauthorized.', 401);
    }

    return fail('Unable to fetch leaderboard.', 400);
  }
}
