export const DEFAULT_SITE_ORIGIN = 'https://brandscope-eight.vercel.app';

export function getSiteOrigin() {
  // Canonical links and authentication emails must always return to the
  // public website. Using window.location.origin here leaks localhost into
  // password-reset and confirmation emails when they are requested in dev.
  const candidate = import.meta.env.VITE_APP_URL || DEFAULT_SITE_ORIGIN;
  try {
    return new URL(candidate).origin;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
}

export function getSiteHost() {
  return new URL(getSiteOrigin()).host;
}
