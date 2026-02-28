const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const optional = (key: string): string | undefined => {
  const value = process.env[key];
  return value && value.length ? value : undefined;
};

export const env = {
  get DATABASE_URL() {
    return required('DATABASE_URL');
  },
  get JWT_SECRET() {
    const secret = required('JWT_SECRET');
    if (secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters.');
    }
    return secret;
  },
  get JWT_EXPIRES_IN() {
    return process.env.JWT_EXPIRES_IN || '7d';
  },
  get COOKIE_DOMAIN() {
    return optional('COOKIE_DOMAIN');
  },
  get ELEAD_WEBHOOK_SECRET() {
   return optional('ELEAD_WEBHOOK_SECRET');
  },
  get FORTELLIS_WEBHOOK_SECRET() {
   return optional('FORTELLIS_WEBHOOK_SECRET');
  },
  get XTIME_WEBHOOK_SECRET() {
   return optional('XTIME_WEBHOOK_SECRET');
  },
  get DRIPJOBS_WEBHOOK_SECRET() {
    return optional('DRIPJOBS_WEBHOOK_SECRET');
  }
};
