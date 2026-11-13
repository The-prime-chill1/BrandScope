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
      ...walk(path.join(root, 'scripts')).map((file) => fs.readFileSync(file, 'utf8')),
      ...walk(path.join(root, 'supabase', 'migrations')).map((file) => fs.readFileSync(file, 'utf8'))
    ].join('\n');

    assert.match(gitignore, /^\.env\*$/m);
    assert.match(gitignore, /^api\/$/m);
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
    const adminConfig = read('src/config/admins.js');
    const configuredEmails = adminConfig.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) || [];
    assert.equal(configuredEmails.length, 3);
  });

  it('keeps authentication and workspace entry on a short non-blocking path', () => {
    const auth = read('src/services/auth.js');
    const context = read('src/contexts/AuthContext.jsx');
    const store = read('src/services/dataStore.js');
    const main = read('src/main.jsx');
    const router = read('src/app/router.jsx');

    assert.match(auth, /auth\.getSession\(\)/);
    assert.doesNotMatch(auth, /auth\.getUser\(\)/);
    assert.doesNotMatch(auth, /from\(['"]profiles['"]\)/);
    assert.match(auth, /signOut\(\{ scope: ['"]local['"] \}\)/);
    assert.match(context, /Promise\.allSettled/);
    assert.match(store, /Promise\.all\(\[\s*notificationQuery/);
    assert.match(main, /requestIdleCallback/);
    assert.match(router, /\blazy\(/);
  });

  it('keeps local credentials and retired API scaffolding outside the project tree', () => {
    assert.equal(fs.existsSync(path.join(root, '.env.example')), false);
    assert.equal(fs.existsSync(path.join(root, 'api')), false);
  });

  it('keeps FAQ in the footer instead of the primary navbar', () => {
    const navbar = read('src/components/navigation/Navbar.jsx');
    const footer = read('src/components/navigation/Footer.jsx');
    assert.doesNotMatch(navbar, /(?:href|to)=["']\/faq["']/);
    assert.match(footer, /(?:href|to)=["']\/faq["']/);
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

  it('keeps Supabase email callbacks on the production website', () => {
    const auth = read('src/services/auth.js');
    const site = read('src/lib/site.js');
    const supabaseConfig = read('supabase/config.toml');

    assert.match(site, /https:\/\/brandscope-eight\.vercel\.app/);
    assert.match(auth, /emailRedirectTo:\s*`\$\{getSiteOrigin\(\)\}\/auth\/confirm`/);
    assert.match(auth, /redirectTo:\s*`\$\{getSiteOrigin\(\)\}\/set-password`/);
    assert.doesNotMatch(auth, /window\.location\.origin/);
    assert.match(supabaseConfig, /site_url\s*=\s*"https:\/\/brandscope-eight\.vercel\.app"/);
    assert.match(supabaseConfig, /https:\/\/brandscope-eight\.vercel\.app\/set-password/);
  });

  it('uses a stable app-style mobile admin navigation', () => {
    const layout = read('src/layouts/AdminLayout.jsx');
    const styles = read('src/styles/signature.css');

    assert.match(layout, /ADMIN_NAV_GROUPS/);
    assert.match(layout, /admin-mobile-tabs/);
    assert.match(layout, /aria-controls="admin-navigation-drawer"/);
    assert.match(styles, /\.admin-sidebar\s*\{[^}]*flex-direction:\s*column/s);
    assert.match(styles, /\.admin-mobile-tabs\s*\{[^}]*position:\s*fixed/s);
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

  it('publishes canonical source attribution and a build-generated sitemap', () => {
    const post = read('src/pages/public/PostDetailPage.jsx');
    const product = read('src/pages/public/ProductDetailPage.jsx');
    const sitemap = read('scripts/generate-sitemap.js');
    const robots = read('public/robots.txt');
    assert.match(post, /Originally published on BRANDSCOPE/);
    assert.match(product, /Source: BRANDSCOPE/);
    assert.match(sitemap, /\/brand\//);
    assert.match(sitemap, /\/product\//);
    assert.match(sitemap, /\/post\//);
    assert.match(sitemap, /xml-stylesheet/);
    assert.doesNotMatch(sitemap, /Authorization:\s*`Bearer/);
    assert.match(robots, /https:\/\/brandscope-eight\.vercel\.app\/sitemap\.xml/);
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

  it('ships an installable PWA experience with offline fallback assets', () => {
    const manifest = JSON.parse(read('public/site.webmanifest'));
    const html = read('index.html');
    const main = read('src/main.jsx');
    const serviceWorker = read('public/sw.js');

    assert.match(manifest.name, /^BRANDSCOPE/);
    assert.equal(manifest.short_name, 'BRANDSCOPE');
    assert.equal(manifest.start_url, '/');
    assert.equal(manifest.display, 'standalone');
    assert.ok(manifest.icons.some((icon) => icon.sizes === '192x192'));
    assert.ok(manifest.icons.some((icon) => icon.sizes === '512x512'));
    assert.ok(fs.statSync(path.join(root, 'public', 'pwa-icon-192.png')).size > 0);
    assert.ok(fs.statSync(path.join(root, 'public', 'pwa-icon-512.png')).size > 0);
    assert.match(html, /site\.webmanifest/);
    assert.match(main, /serviceWorker\.register\('\/sw\.js'\)/);
    assert.match(serviceWorker, /offline\.html/);
  });

  it('uses the accessible BRANDSCOPE dropdown instead of awkward native selects', () => {
    const jsxSource = walk(path.join(root, 'src'))
      .filter((file) => /\.jsx$/.test(file))
      .map((file) => fs.readFileSync(file, 'utf8'))
      .join('\n');
    const selectField = read('src/components/common/SelectField.jsx');

    assert.doesNotMatch(jsxSource, /<select\b/i);
    assert.match(selectField, /role="listbox"/);
    assert.match(selectField, /aria-expanded/);
    assert.match(selectField, /ArrowDown/);
    assert.match(selectField, /select-mobile-backdrop/);
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
