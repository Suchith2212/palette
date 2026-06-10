/** Production API origin without trailing slash (e.g. https://palette-api-production.onrender.com) */
export const getApiOrigin = (): string =>
  (import.meta.env.VITE_API_ORIGIN || '').trim().replace(/\/$/, '');
