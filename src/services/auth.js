import { isSupabaseConfigured, requireSupabase, supabase } from '../lib/supabase';
import { getSiteOrigin } from '../lib/site';
import { isAdministratorEmail } from '../config/admins';
import { dataStore } from './dataStore';

const PENDING_ONBOARDING_KEY = 'brandscope_pending_onboarding';

function normalizeUser(authUser) {
  if (!authUser) return null;
  const email = authUser.email || '';
  return {
    id: authUser.id,
    uid: authUser.id,
    email,
    name: authUser.user_metadata?.contact_name || email.split('@')[0],
    role: isAdministratorEmail(email) ? 'admin' : 'brand_owner',
    emailVerified: Boolean(authUser.email_confirmed_at),
    createdAt: authUser.created_at
  };
}

function savePendingOnboarding(email, brandDetails) {
  try {
    localStorage.setItem(PENDING_ONBOARDING_KEY, JSON.stringify({
      email: email.toLowerCase(),
      brandDetails,
      savedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.warn('[BRANDSCOPE] Media could not be kept for post-verification upload:', error);
  }
}

function getPendingOnboarding(email) {
  try {
    const raw = localStorage.getItem(PENDING_ONBOARDING_KEY);
    if (!raw) return null;
    const pending = JSON.parse(raw);
    return pending.email === email.toLowerCase() ? pending : null;
  } catch {
    return null;
  }
}

async function completeOnboardingMedia(user, brandDetails) {
  const brand = await dataStore.refreshOwnedBrand(user.uid);
  if (!brand) return;

  const onboardingUpdates = {};
  if (brandDetails.logoUrl) onboardingUpdates.logoUrl = brandDetails.logoUrl;
  if (brandDetails.coverUrl) onboardingUpdates.coverUrl = brandDetails.coverUrl;
  if (brandDetails.contactEmail) onboardingUpdates.contactEmail = brandDetails.contactEmail;
  if (Object.keys(onboardingUpdates).length) {
    await dataStore.updateBrand(brand.id, onboardingUpdates, user.uid);
  }

  if (brandDetails.brandType === 'enterprise' || brandDetails.brandType === 'corporate') {
    if (brandDetails.cacNumber || brandDetails.documentUrl) {
      await dataStore.submitVerificationRequest(brand.id, {
        legalEntityName: brandDetails.name,
        businessRegNumber: brandDetails.cacNumber || 'Pending document review',
        directorName: user.name || '',
        idType: 'cac_cert',
        idNumber: '',
        websiteDomain: brandDetails.website || '',
        registeredAddress: brandDetails.address || '',
        documentUrl: brandDetails.documentUrl || ''
      }, user.uid);
    }
  }
}

async function finalizePendingOnboarding(user) {
  const pending = getPendingOnboarding(user.email);
  if (!pending) return;
  await completeOnboardingMedia(user, pending.brandDetails);
  localStorage.removeItem(PENDING_ONBOARDING_KEY);
}

export const authService = {
  isConfigured: isSupabaseConfigured,

  async getCurrentUser() {
    if (!supabase) return null;
    // Browser session restoration is local. RLS still validates the JWT on
    // every protected database request, so startup does not need an extra Auth
    // server round trip before rendering the workspace.
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      if (error.name === 'AuthSessionMissingError') return null;
      throw error;
    }
    const authUser = data.session?.user;
    if (!authUser) return null;
    const user = normalizeUser(authUser);
    void finalizePendingOnboarding(user).catch((onboardingError) => {
      console.warn('[BRANDSCOPE] Pending brand media could not finish in the background:', onboardingError);
    });
    return user;
  },

  onAuthStateChange(callback) {
    if (!supabase) return () => {};
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session?.user || null);
    });
    return () => data.subscription.unsubscribe();
  },

  async login(email, password, remember = true) {
    const client = requireSupabase();
    localStorage.setItem('brandscope_remember_session', remember ? 'true' : 'false');
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    if (error) throw error;
    const user = normalizeUser(data.user);
    void finalizePendingOnboarding(user).catch((onboardingError) => {
      console.warn('[BRANDSCOPE] Pending brand media could not finish in the background:', onboardingError);
    });
    return user;
  },

  async register({ email, password, remember = true, contactName, brandDetails }) {
    const client = requireSupabase();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedSlug = brandDetails.slug.trim().toLowerCase();
    localStorage.setItem('brandscope_remember_session', remember ? 'true' : 'false');

    const { data, error } = await client.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${getSiteOrigin()}/auth/confirm`,
        data: {
          contact_name: contactName.trim(),
          brand_name: brandDetails.name.trim(),
          brand_slug: normalizedSlug,
          brand_type: normalizeBrandType(brandDetails.brandType),
          category_slug: brandDetails.categorySlug || 'other-businesses',
          country: brandDetails.country || 'Nigeria',
          city: brandDetails.city || '',
          whatsapp: brandDetails.whatsapp || '',
          phone: brandDetails.phone || '',
          contact_email: brandDetails.contactEmail || '',
          website: brandDetails.website || '',
          short_description: brandDetails.shortDescription || '',
          registration_number: brandDetails.cacNumber || ''
        }
      }
    });
    if (error) throw error;
    if (!data.user) throw new Error('Supabase did not return a user account. Please try again.');

    const user = normalizeUser(data.user);
    if (!data.session) {
      savePendingOnboarding(normalizedEmail, brandDetails);
      return { ...user, requiresEmailConfirmation: true };
    }

    // The account and database brand are already created transactionally by
    // Supabase. Uploading optional images must not hold the user on the signup
    // screen, so it continues after navigation.
    const onboardingTask = completeOnboardingMedia(user, brandDetails);
    return { ...user, onboardingTask };
  },

  async logout() {
    if (!supabase) return;
    // Local scope removes the browser session before the revocation request,
    // so the UI can leave the protected workspace immediately.
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) throw error;
    localStorage.removeItem('brandscope_remember_session');
  },

  async resetPassword(email) {
    const client = requireSupabase();
    const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${getSiteOrigin()}/set-password`
    });
    if (error) {
      if (error.status === 429 || error.code === 'over_email_send_rate_limit') {
        const rateLimitError = new Error('Too many recovery emails were requested. Please wait before trying again and use the newest email in your inbox.');
        rateLimitError.name = 'AuthRateLimitError';
        rateLimitError.status = 429;
        rateLimitError.code = 'over_email_send_rate_limit';
        throw rateLimitError;
      }
      throw error;
    }
  },

  async updatePassword(password) {
    const client = requireSupabase();
    const { data, error } = await client.auth.updateUser({ password });
    if (error) throw error;
    return normalizeUser(data.user);
  },

  async normalizeUser(authUser) {
    return normalizeUser(authUser);
  }
};

function normalizeBrandType(value) {
  return value === 'enterprise' ? 'corporate' : value || 'small';
}

export default authService;
