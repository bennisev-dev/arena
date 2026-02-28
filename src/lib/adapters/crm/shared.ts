export const ensureArray = <T>(value: T | T[] | undefined): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

export const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export const normalizeMonthYear = (month?: number, year?: number, timestamp?: string): { month: number; year: number } => {
  if (month && year) return { month, year };

  if (timestamp) {
    const date = new Date(timestamp);
    if (!Number.isNaN(date.getTime())) {
      return { month: date.getUTCMonth() + 1, year: date.getUTCFullYear() };
    }
  }

  const now = new Date();
  return { month: now.getUTCMonth() + 1, year: now.getUTCFullYear() };
};
