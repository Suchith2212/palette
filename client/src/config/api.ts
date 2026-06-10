/** Railway / production API origin without trailing slash (e.g. https://palette-api.up.railway.app) */
export const getApiOrigin = (): string =>
  (import.meta.env.VITE_API_ORIGIN || '').trim().replace(/\/$/, '');
