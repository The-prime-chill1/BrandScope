const DEFAULT_SITE_URL = 'https://brandscope-eight.vercel.app';
const PAGE_SIZE = 1000;
const MAX_ROWS_PER_RESOURCE = 10000;

const STATIC_ROUTES = [
  ['/', '1.0', 'daily'],
  ['/discover', '0.9', 'daily'],
  ['/categories', '0.8', 'weekly'],
  ['/feed', '0.8', 'daily'],
  ['/about', '0.6', 'monthly'],
  ['/faq', '0.6', 'monthly'],
  ['/contact', '0.5', 'monthly'],
  ['/privacy', '0.3', 'monthly'],
  ['/terms', '0.3', 'monthly'],
  ['/guidelines', '0.4', 'monthly']
];

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function normalizeSiteUrl(value) {
  try {
    const url = new URL(value || DEFAULT_SITE_URL);
    if (!['http:', 'https:'].includes(url.protocol)) return DEFAULT_SITE_URL;
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

function normalizeLastModified(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function urlEntry(siteUrl, path, { lastModified, priority, changeFrequency } = {}) {
  const lines = [
    '  <url>',
    `    <loc>${escapeXml(`${siteUrl}${path}`)}</loc>`
  ];
  const normalizedDate = normalizeLastModified(lastModified);
  if (normalizedDate) lines.push(`    <lastmod>${escapeXml(normalizedDate)}</lastmod>`);
  if (changeFrequency) lines.push(`    <changefreq>${escapeXml(changeFrequency)}</changefreq>`);
  if (priority) lines.push(`    <priority>${escapeXml(priority)}</priority>`);
  lines.push('  </url>');
  return lines.join('\n');
}

async function fetchAllRows(baseUrl, publishableKey, resource) {
  if (!baseUrl || !publishableKey) return [];
  const rows = [];
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  for (let start = 0; start < MAX_ROWS_PER_RESOURCE; start += PAGE_SIZE) {
    const response = await fetch(`${cleanBaseUrl}/rest/v1/${resource}`, {
      headers: {
        apikey: publishableKey,
        Accept: 'application/json',
        Range: `${start}-${start + PAGE_SIZE - 1}`,
        'Range-Unit': 'items'
      }
    });
    if (!response.ok) throw new Error(`Supabase returned HTTP ${response.status}.`);
    const page = await response.json();
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }

  return rows;
}

async function fetchPublicRows(baseUrl, publishableKey, resource, label, onWarning) {
  try {
    return await fetchAllRows(baseUrl, publishableKey, resource);
  } catch (error) {
    onWarning?.(`The ${label} sitemap entries could not be loaded: ${error.message}`);
    return [];
  }
}

export async function generateSitemap({
  siteUrl = DEFAULT_SITE_URL,
  supabaseUrl = '',
  publishableKey = '',
  onWarning
} = {}) {
  const canonicalOrigin = normalizeSiteUrl(siteUrl);
  const entries = STATIC_ROUTES.map(([path, priority, changeFrequency]) =>
    urlEntry(canonicalOrigin, path, { priority, changeFrequency })
  );

  const [categories, brands, products, posts] = await Promise.all([
    fetchPublicRows(supabaseUrl, publishableKey, 'categories?select=slug,updated_at&is_active=eq.true&order=sort_order.asc', 'category', onWarning),
    fetchPublicRows(supabaseUrl, publishableKey, 'brands?select=slug,updated_at&status=eq.active&order=updated_at.desc', 'brand', onWarning),
    fetchPublicRows(supabaseUrl, publishableKey, 'products?select=id,updated_at&order=updated_at.desc', 'product', onWarning),
    fetchPublicRows(supabaseUrl, publishableKey, 'posts?select=id,updated_at&status=eq.published&order=updated_at.desc', 'post', onWarning)
  ]);

  categories.forEach((category) => entries.push(urlEntry(canonicalOrigin, `/categories/${encodeURIComponent(category.slug)}`, {
    lastModified: category.updated_at,
    priority: '0.7',
    changeFrequency: 'weekly'
  })));
  brands.forEach((brand) => entries.push(urlEntry(canonicalOrigin, `/brand/${encodeURIComponent(brand.slug)}`, {
    lastModified: brand.updated_at,
    priority: '0.9',
    changeFrequency: 'daily'
  })));
  products.forEach((product) => entries.push(urlEntry(canonicalOrigin, `/product/${encodeURIComponent(product.id)}`, {
    lastModified: product.updated_at,
    priority: '0.8',
    changeFrequency: 'weekly'
  })));
  posts.forEach((post) => entries.push(urlEntry(canonicalOrigin, `/post/${encodeURIComponent(post.id)}`, {
    lastModified: post.updated_at,
    priority: '0.7',
    changeFrequency: 'weekly'
  })));

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    ''
  ].join('\n');
}

export function sitemapPlugin(options) {
  return {
    name: 'brandscope-sitemap',
    apply: 'build',
    async generateBundle() {
      const source = await generateSitemap({
        ...options,
        onWarning: (message) => this.warn(message)
      });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source });
    }
  };
}

export { DEFAULT_SITE_URL };
