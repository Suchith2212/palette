const DEV_FALLBACK = 'palette-dev-jwt-secret-change-me';

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set when NODE_ENV=production');
  }

  console.warn('[auth] JWT_SECRET is not set — using development fallback');
  return DEV_FALLBACK;
};
