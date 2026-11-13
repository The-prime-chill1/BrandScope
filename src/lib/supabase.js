import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

if (typeof window !== 'undefined' && window.location.hash) {
  const flowType = new URLSearchParams(window.location.hash.slice(1)).get('type');
  if (flowType === 'invite' || flowType === 'recovery') {
    sessionStorage.setItem('brandscope_auth_flow', flowType);
  }
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-ref') &&
  !supabasePublishableKey.includes('your-publishable-key')
);

const browserAuthStorage = typeof window === 'undefined' ? undefined : {
  getItem(key) {
    return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
  },
  setItem(key, value) {
    const remember = window.localStorage.getItem('brandscope_remember_session') !== 'false';
    const primary = remember ? window.localStorage : window.sessionStorage;
    const secondary = remember ? window.sessionStorage : window.localStorage;
    secondary.removeItem(key);
    primary.setItem(key, value);
  },
  removeItem(key) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: browserAuthStorage
      },
      realtime: {
        params: { eventsPerSecond: 10 }
      }
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local.');
  }
  return supabase;
}

export default supabase;
