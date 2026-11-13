const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const migrationFiles = fs.readdirSync(path.join(root, 'supabase', 'migrations')).sort();
const migrations = migrationFiles.map((file) => read(path.join('supabase', 'migrations', file))).join('\n');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

describe('BRANDSCOPE production invariants', () => {
  it('uses a pinned Supabase client and contains no Firebase or Paystack dependency', () => {
    const packageJson = JSON.parse(read('package.json'));
    assert.equal(packageJson.dependencies['@supabase/supabase-js'], '2.119.0');
    assert.equal(packageJson.dependencies.firebase, undefined);
    assert.equal(packageJson.dependencies.paystack, undefined);
  });

  it('keeps environment files and live API credentials out of tracked application files', () => {
    const gitignore = read('.gitignore');
    const committedApplicationText = [
      read('README.md'),
      read('package.json'),
      read('vercel.json'),
      read('vite.config.js'),
      ...walk(path.join(root, 'src')).map((file) => fs.readFileSync(file, 'utf8')),
      ...walk(path.join(root, 'api')).map((file) => fs.readFileSync(file, 'utf8')),
      ...walk(path.join(root, 'supabase', 'migrations')).map((file) => fs.readFileSync(file, 'utf8'))
    ].join('\n');

    assert.match(gitignore, /^\.env\*$/m);
    assert.doesNotMatch(committedApplicationText, /sb_(?:publishable|secret)_[A-Za-z0-9_-]{10,}/);
    assert.doesNotMatch(committedApplicationText, /https:\/\/[a-z0-9]{20}\.supabase\.co/i);
    assert.doesNotMatch(committedApplicationText, /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/);
  });

  it('enables RLS and applies explicit least-privilege grants', () => {
    for (const table of ['profiles', 'brands', 'products', 'posts', 'comments', 'reports', 'verification_requests', 'audit_logs']) {
      assert.match(migrations, new RegExp(`alter table public\\.${table} enable row level security`, 'i'));
    }
    assert.match(migrations, /revoke all on table[\s\S]*public\.profiles[\s\S]*from anon, authenticated/i);
    assert.match(migrations, /grant update \(contact_name\)[\s\S]*public\.profiles/i);
    assert.doesNotMatch(migrations, /grant update \([^)]*role[^)]*\)[\s\S]*public\.profiles/i);
  });

  it('prevents browser accounts from setting verification and admin fields directly', () => {
    const leastPrivilege = migrationFiles
      .filter((file) => file.includes('least_privilege'))
      .map((file) => read(path.join('supabase', 'migrations', file)))
      .join('\n');
    assert.doesNotMatch(leastPrivilege, /grant update \([^)]*verification_status/i);
    assert.doesNotMatch(leastPrivilege, /grant update \([^)]*role/i);
    assert.match(migrations, /administrator access required/i);
  });

  it('protects Storage with account-scoped folders', () => {
    assert.match(migrations, /bucket_id = 'brand-media'[\s\S]*storage\.foldername\(name\)/i);
    assert.match(migrations, /bucket_id = 'verification-documents'[\s\S]*storage\.foldername\(name\)/i);
    assert.match(migrations, /users read own verification documents/i);
  });

  it('contains the three authorized administrator emails in the database allowlist', () => {
    for (const email of [
      'chilltech2k26@gmail.com',
      'lamidiabdulhameedolawale@gmail.com',
      'lamidiabdulhameedolawale21@gmail.com'
    ]) {
      assert.match(migrations, new RegExp(email.replace('.', '\\.'), 'i'));
    }
  });

  it('provides Remember Me, password visibility, reset, and invite password flows', () => {
    const login = read('src/pages/auth/LoginPage.jsx');
    const signup = read('src/pages/auth/SignupPage.jsx');
    const recovery = read('src/pages/auth/ForgotPasswordPage.jsx');
    assert.match(login, /Remember me/);
    assert.match(signup, /Remember me/);
    assert.match(login, /showPassword/);
    assert.match(signup, /showConfirmPassword/);
    assert.match(recovery, /resetPassword/);
    assert.match(recovery, /SetPasswordPage/);
  });

  it('uses USD throughout the public product experience', () => {
    const productPages = [
      read('src/pages/public/BrandProfilePage.jsx'),
      read('src/pages/public/ProductDetailPage.jsx'),
      read('src/pages/dashboard/ManageProducts.jsx')
    ].join('\n');
    assert.match(productPages, /USD/);
    assert.doesNotMatch(productPages, /NGN|₦/);
  });

  it('publishes canonical source attribution and a dynamic sitemap', () => {
    const post = read('src/pages/public/PostDetailPage.jsx');
    const product = read('src/pages/public/ProductDetailPage.jsx');
    const sitemap = read('api/sitemap.js');
    assert.match(post, /Originally published on BRANDSCOPE/);
    assert.match(product, /Source: BRANDSCOPE/);
    assert.match(sitemap, /\/brand\//);
    assert.match(sitemap, /\/product\//);
    assert.match(sitemap, /\/post\//);
  });

  it('ships Vercel SPA rewrites and no placeholder Search Console token', () => {
    const vercel = read('vercel.json');
    const html = read('index.html');
    assert.match(vercel, /\/dashboard\/:path\*/);
    assert.match(vercel, /\/admin\/:path\*/);
    assert.match(vercel, /\/sitemap\.xml/);
    assert.doesNotMatch(html, /YOUR_GOOGLE_SEARCH_CONSOLE/);
    assert.doesNotMatch(html, /brandscope-og\.png/);
  });

  it('contains no legacy monetization or Firebase implementation in application source', () => {
    const source = walk(path.join(root, 'src'))
      .filter((file) => /\.(js|jsx|css)$/.test(file))
      .map((file) => fs.readFileSync(file, 'utf8'))
      .join('\n');
    assert.doesNotMatch(source, /firebase|firestore|paystack/i);
    assert.doesNotMatch(source, /premium monthly|featured placement|sponsored listing/i);
  });
});
