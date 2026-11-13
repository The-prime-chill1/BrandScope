import { isSupabaseConfigured, requireSupabase, supabase } from '../lib/supabase';
import { dataStore } from './dataStore';

const PENDING_ONBOARDING_KEY = 'brandscope_pending_onboarding';
async function loadProfile(userId) {
  const client = requireSupabase();
  const { data, error } = await client.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

async function normalizeUser(authUser) {
  if (!authUser) return null;
  let profile = null;
  try {
    profile = await loadProfile(authUser.id);
  } catch (error) {
    console.warn('[BRANDSCOPE] Profile role could not be loaded yet:', error);
  }

  const email = authUser.email || '';
  return {
    id: authUser.id,
    uid: authUser.id,
    email,
    name: profile?.contact_name || authUser.user_metadata?.contact_name || email.split('@')[0],
    role: profile?.role || 'brand_owner',
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
  await dataStore.refreshPublicData();
  const brand = dataStore.getBrandByOwnerUid(user.uid);
  if (!brand) return;

  const mediaUpdates = {};
  if (brandDetails.logoUrl) mediaUpdates.logoUrl = brandDetails.logoUrl;
  if (brandDetails.coverUrl) mediaUpdates.coverUrl = brandDetails.coverUrl;
  if (Object.keys(mediaUpdates).length) {
    await dataStore.updateBrand(brand.id, mediaUpdates, user.uid);
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
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      if (error.name === 'AuthSessionMissingError') return null;
      throw error;
    }
    if (!data.user) return null;
    const user = await normalizeUser(data.user);
    await finalizePendingOnboarding(user);
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
    const user = await normalizeUser(data.user);
    await finalizePendingOnboarding(user);
    await dataStore.refreshAll(user);
    return user;
  },

  async register({ email, password, remember = true, contactName, brandDetails }) {
    const client = requireSupabase();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedSlug = brandDetails.slug.trim().toLowerCase();
    localStorage.setItem('brandscope_remember_session', remember ? 'true' : 'false');

    const slugResult = await client.from('brands').select('id').eq('slug', normalizedSlug).maybeSingle();
    if (slugResult.error) throw slugResult.error;
    if (slugResult.data) throw new Error('That brand URL is already in use. Please choose another slug.');

    const { data, error } = await client.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: {
          contact_name: contactName.trim(),
          brand_name: brandDetails.name.trim(),
          brand_slug: normalizedSlug,
          brand_type: normalizeBrandType(brandDetails.brandType),
          category_slug: brandDetails.categorySlug || 'other-businesses',
          country: brandDetails.country || 'Nigeria',
          city: brandDetails.city || '',
          whatsapp: brandDetails.whatsapp || '',
          phone: brandDetails.phone || brandDetails.whatsapp || '',
          website: brandDetails.website || '',
          short_description: brandDetails.shortDescription || '',
          registration_number: brandDetails.cacNumber || ''
        }
      }
    });
    if (error) throw error;
    if (!data.user) throw new Error('Supabase did not return a user account. Please try again.');

    const user = await normalizeUser(data.user);
    if (!data.session) {
      savePendingOnboarding(normalizedEmail, brandDetails);
      return { ...user, requiresEmailConfirmation: true };
    }

    await completeOnboardingMedia(user, brandDetails);
    await dataStore.refreshAll(user);
    return user;
  },

  async logout() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem('brandscope_remember_session');
  },

  async resetPassword(email) {
    const client = requireSupabase();
    const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/set-password`
    });
    if (error) throw error;
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
