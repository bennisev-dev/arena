import type { AuthUser } from '@/services/auth.service';
import type { SessionPayload } from '@/lib/auth/jwt';

export const buildSessionPayload = (user: AuthUser): SessionPayload => {
  return {
    sub: user.id,
    organizationId: user.organization_id ?? null,
    role: user.role,
    dealershipId: user.dealership_id,
    onboardingComplete: user.onboarding_complete
  };
};
