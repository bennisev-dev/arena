import type { AuthUser } from '@/services/auth.service';
import type { SessionPayload } from '@/lib/auth/jwt';

export const buildSessionPayload = (user: AuthUser): SessionPayload => {
  return {
    sub: user.id,
    role: user.role,
    dealershipId: user.dealership_id,
    onboardingComplete: user.onboarding_complete
  };
};
