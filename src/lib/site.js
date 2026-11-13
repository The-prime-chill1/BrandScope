export const DEFAULT_SITE_ORIGIN = 'https://brandscope-eight.vercel.app';

export function getSiteOrigin() {
  const candidate = import.meta.env.VITE_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : DEFAULT_SITE_ORIGIN);
  try {
    return new URL(candidate).origin;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
}

export function getSiteHost() {
  return new URL(getSiteOrigin()).host;
}
