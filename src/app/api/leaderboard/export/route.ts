import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/auth/guard';
import { getLeaderboard, leaderboardToCsv } from '@/services/leaderboard.service';

const querySchema = z.object({
  metric: z
    .enum(['leads_created', 'cars_sold', 'profit_total', 'vehicle_value_total', 'services_completed', 'efficiency_rate'])
    .default('leads_created'),
  department: z.enum(['sales', 'service', 'all']).default('all')
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, ['manager']);

    if (!session.dealershipId) {
      return new Response('Onboarding incomplete.', { status: 403 });
    }

    const query = querySchema.parse({
      metric: request.nextUrl.searchParams.get('metric') ?? undefined,
      department: request.nextUrl.searchParams.get('department') ?? undefined
    });

    const data = await getLeaderboard({
      viewerUserId: session.sub,
      role: 'manager',
      dealershipId: session.dealershipId,
      metric: query.metric,
      department: query.department
    });

    const rows = [...data.podium, ...data.leaderboard];
    const csv = leaderboardToCsv(rows);

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="arena-leaderboard-${data.year}-${String(data.month).padStart(2, '0')}.csv"`
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return new Response('Unauthorized.', { status: 401 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return new Response('Forbidden.', { status: 403 });
    }

    return new Response('Unable to export leaderboard.', { status: 400 });
  }
}
