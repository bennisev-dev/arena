import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { db } from '@/lib/db';

const onboardingSchema = z.object({
  role: z.enum(['sales_rep', 'service_rep', 'manager']),
  dealershipId: z.string().min(1).max(120),
  crmSource: z.enum(['elead', 'fortellis', 'xtime', 'dripjobs']),
  externalUserId: z.string().min(1).max(120)
});

export const completeOnboarding = async (userId: string, input: unknown) => {
  const data = onboardingSchema.parse(input);

  try {
    return await db.user.update({
      where: { id: userId },
      data: {
        role: data.role,
        dealership_id: data.dealershipId,
        crm_source: data.crmSource,
        external_user_id: data.externalUserId,
        onboarding_complete: true
      },
      select: {
        id: true,
        role: true,
        dealership_id: true,
        onboarding_complete: true
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('EXTERNAL_USER_ALREADY_MAPPED');
    }
    throw error;
  }
};
