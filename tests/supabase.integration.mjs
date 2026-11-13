import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

function readLocalEnv() {
  if (!fs.existsSync('.env.local')) return {};
  return Object.fromEntries(
    fs.readFileSync('.env.local', 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator), line.slice(separator + 1)];
      })
  );
}

const localEnv = readLocalEnv();
const supabaseUrl = process.env.VITE_SUPABASE_URL || localEnv.VITE_SUPABASE_URL;
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || localEnv.VITE_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
  throw new Error('Set VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SERVICE_ROLE_KEY before running this verification.');
}

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
};

const admin = createClient(supabaseUrl, serviceRoleKey, clientOptions);
const suffix = `${Date.now()}-${randomUUID().slice(0, 8)}`;
const password = `Bs!${randomUUID()}aA1`;
const testUsers = [
  {
    email: `brandscope-rls-a-${suffix}@example.com`,
    metadata: {
      contact_name: 'RLS Test A',
      brand_name: `RLS Test Brand A ${suffix}`,
      brand_slug: `rls-test-a-${suffix}`,
      brand_type: 'small',
      category_slug: 'technology',
      country: 'Nigeria',
      city: 'Lagos',
      whatsapp: '2348000000001',
      short_description: 'Temporary automated RLS verification account.'
    }
  },
  {
    email: `brandscope-rls-b-${suffix}@example.com`,
    metadata: {
      contact_name: 'RLS Test B',
      brand_name: `RLS Test Brand B ${suffix}`,
      brand_slug: `rls-test-b-${suffix}`,
      brand_type: 'small',
      category_slug: 'technology',
      country: 'Nigeria',
      city: 'Abuja',
      whatsapp: '2348000000002',
      short_description: 'Temporary automated RLS verification account.'
    }
  }
];

const createdUserIds = [];
const cleanupObjects = {
  'brand-media': [],
  'verification-documents': []
};
const checks = [];

function check(name, condition, detail = '') {
  checks.push({ name, passed: Boolean(condition), detail });
  if (!condition) throw new Error(`${name}${detail ? `: ${detail}` : ''}`);
}

async function createTestUser(definition) {
  const { data, error } = await admin.auth.admin.createUser({
    email: definition.email,
    password,
    email_confirm: true,
    user_metadata: definition.metadata
  });
  if (error) throw error;
  createdUserIds.push(data.user.id);
  return data.user;
}

async function signIn(email) {
  const client = createClient(supabaseUrl, publishableKey, clientOptions);
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

try {
  const [userA, userB] = await Promise.all(testUsers.map(createTestUser));
  const [clientA, clientB] = await Promise.all(testUsers.map((user) => signIn(user.email)));

  const { data: profileA, error: profileError } = await clientA
    .from('profiles')
    .select('role')
    .eq('id', userA.id)
    .single();
  check('New business accounts receive the brand_owner role', !profileError && profileA?.role === 'brand_owner', profileError?.message);

  const [{ data: brandA, error: brandAError }, { data: brandB, error: brandBError }] = await Promise.all([
    clientA.from('brands').select('id,owner_id,verification_status').eq('owner_id', userA.id).single(),
    clientB.from('brands').select('id,owner_id,verification_status').eq('owner_id', userB.id).single()
  ]);
  check('Signup trigger creates the first brand', !brandAError && brandA?.owner_id === userA.id, brandAError?.message);
  check('Each brand remains attached to its owner', !brandBError && brandB?.owner_id === userB.id, brandBError?.message);

  const { data: product, error: productError } = await clientA
    .from('products')
    .insert({ brand_id: brandA.id, title: 'Temporary RLS Product', price: 12.5, currency: 'USD' })
    .select('id,title')
    .single();
  check('Brand owners can publish their own products', !productError && Boolean(product?.id), productError?.message);

  const { data: post, error: postError } = await clientA
    .from('posts')
    .insert({ brand_id: brandA.id, content: 'Temporary RLS post verification.' })
    .select('id')
    .single();
  check('Brand owners can publish their own posts', !postError && Boolean(post?.id), postError?.message);

  const foreignUpdate = await clientB
    .from('products')
    .update({ title: 'Blocked ownership change' })
    .eq('id', product.id)
    .select('id');
  check('Other accounts cannot update a brand product', !foreignUpdate.error && foreignUpdate.data?.length === 0, foreignUpdate.error?.message);

  const foreignInsert = await clientB
    .from('products')
    .insert({ brand_id: brandA.id, title: 'Blocked foreign product', price: 1, currency: 'USD' });
  check('Other accounts cannot add products to a brand', Boolean(foreignInsert.error), foreignInsert.error ? '' : 'A foreign product insert unexpectedly succeeded.');

  const selfVerification = await clientA
    .from('brands')
    .update({ verification_status: 'verified' })
    .eq('id', brandA.id);
  const { data: brandAfterVerificationAttempt } = await clientA
    .from('brands')
    .select('verification_status')
    .eq('id', brandA.id)
    .single();
  check(
    'Brand owners cannot self-verify',
    Boolean(selfVerification.error) && brandAfterVerificationAttempt?.verification_status !== 'verified',
    selfVerification.error?.message
  );

  const deniedAdminRpc = await clientA.rpc('admin_set_brand_verification', {
    target_brand_id: brandA.id,
    new_status: 'verified'
  });
  check('Admin RPCs reject normal accounts', Boolean(deniedAdminRpc.error), deniedAdminRpc.error ? '' : 'The privileged RPC unexpectedly succeeded.');

  const png = Uint8Array.from(Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z1KkAAAAASUVORK5CYII=',
    'base64'
  ));
  const brandMediaPath = `${userA.id}/integration/${suffix}.png`;
  cleanupObjects['brand-media'].push(brandMediaPath);
  const ownUpload = await clientA.storage.from('brand-media').upload(brandMediaPath, png, { contentType: 'image/png' });
  check('Users can upload media inside their own folder', !ownUpload.error, ownUpload.error?.message);

  const blockedMediaPath = `${userA.id}/integration/${suffix}-blocked.png`;
  const foreignUpload = await clientB.storage.from('brand-media').upload(blockedMediaPath, png, { contentType: 'image/png' });
  check('Users cannot upload into another account folder', Boolean(foreignUpload.error), foreignUpload.error ? '' : 'A foreign storage upload unexpectedly succeeded.');

  const verificationPath = `${userA.id}/integration/${suffix}.png`;
  cleanupObjects['verification-documents'].push(verificationPath);
  const privateUpload = await clientA.storage.from('verification-documents').upload(verificationPath, png, { contentType: 'image/png' });
  check('Users can upload their own verification document', !privateUpload.error, privateUpload.error?.message);

  const privateRead = await clientB.storage.from('verification-documents').download(verificationPath);
  check('Other accounts cannot read private verification documents', Boolean(privateRead.error), privateRead.error ? '' : 'A private document was readable by another account.');

  console.log(JSON.stringify({ passed: true, checks }, null, 2));
} finally {
  for (const [bucket, paths] of Object.entries(cleanupObjects)) {
    if (paths.length) await admin.storage.from(bucket).remove(paths);
  }
  for (const userId of createdUserIds) {
    await admin.auth.admin.deleteUser(userId);
  }
}
