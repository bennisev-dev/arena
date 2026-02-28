import type { Role } from '@prisma/client';

export type ArenaRole = Role;

const rolePermissions: Record<ArenaRole, string[]> = {
  sales_rep: ['leaderboard:sales:view', 'stats:self:view'],
  service_rep: ['leaderboard:service:view', 'stats:self:view'],
  manager: ['leaderboard:all:view', 'leaderboard:export', 'stats:all:view', 'users:all:view']
};

export const hasPermission = (role: ArenaRole | null | undefined, permission: string): boolean => {
  if (!role) return false;
  return rolePermissions[role].includes(permission);
};

export const assertRole = (role: ArenaRole | null | undefined, allowedRoles: ArenaRole[]): void => {
  if (!role || !allowedRoles.includes(role)) {
    throw new Error('FORBIDDEN');
  }
};
