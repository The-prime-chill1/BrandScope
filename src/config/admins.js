export const ADMIN_EMAILS = Object.freeze([
  'chilltech2k26@gmail.com',
  'lamidiabdulhameedolawale@gmail.com',
  'lamidiabdulhameedolawale21@gmail.com'
]);

const ADMIN_EMAIL_SET = new Set(ADMIN_EMAILS);

// This only controls client-side navigation and presentation. Supabase RLS and
// the private database allowlist remain the authority for administrative data.
export function isAdministratorEmail(email = '') {
  return ADMIN_EMAIL_SET.has(email.trim().toLowerCase());
}

