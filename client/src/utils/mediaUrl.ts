const configuredApiOrigin = (import.meta.env.VITE_API_ORIGIN || '').trim();

const normalizedApiOrigin = configuredApiOrigin.endsWith('/')
  ? configuredApiOrigin.slice(0, -1)
  : configuredApiOrigin;

export const toMediaUrl = (pathOrUrl?: string): string => {
  if (!pathOrUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;

  if (normalizedApiOrigin) {
    return `${normalizedApiOrigin}${normalizedPath}`;
  }

  return normalizedPath;
};
