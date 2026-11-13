const STATIC_ROUTES = [
  ['/', '1.0', 'daily'],
  ['/discover', '0.9', 'daily'],
  ['/categories', '0.8', 'weekly'],
  ['/feed', '0.8', 'daily'],
  ['/about', '0.6', 'monthly'],
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

function normalizeSiteUrl(req) {
  const configured = process.env.SITE_URL || process.env.VITE_APP_URL;
  const fallbackHost = req.headers['x-forwarded-host'] || req.headers.host || 'brandscope.network';
  return (configured || `https://${fallbackHost}`).replace(/\/$/, '');
}

function toLastModified(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

async function fetchAllRows(baseUrl, publishableKey, resource) {
  if (!baseUrl || !publishableKey) return [];
  const pageSize = 1000;
  const rows = [];

  for (let start = 0; start < 10000; start += pageSize) {
    const response = await fetch(`${baseUrl}/rest/v1/${resource}`, {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
        Range: `${start}-${start + pageSize - 1}`
      }
    });
    if (!response.ok) throw new Error(`Supabase sitemap query failed with ${response.status}.`);
    const page = await response.json();
    rows.push(...page);
    if (page.length < pageSize) break;
  }

  return rows;
}

function urlEntry(siteUrl, path, lastModified, priority, changeFrequency) {
  return [
    '  <url>',
    `    <loc>${escapeXml(`${siteUrl}${path}`)}</loc>`,
    `    <lastmod>${escapeXml(toLastModified(lastModified))}</lastmod>`,
    `    <changefreq>${changeFrequency}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>'
  ].join('\n');
}

export default async function handler(req, res) {
  const siteUrl = normalizeSiteUrl(req);
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const entries = STATIC_ROUTES.map(([path, priority, frequency]) =>
    urlEntry(siteUrl, path, new Date(), priority, frequency)
  );

  try {
    const [categories, brands, products, posts] = await Promise.all([
      fetchAllRows(supabaseUrl, publishableKey, 'categories?select=slug,updated_at&is_active=eq.true&order=sort_order.asc'),
      fetchAllRows(supabaseUrl, publishableKey, 'brands?select=slug,updated_at&status=eq.active&order=updated_at.desc'),
      fetchAllRows(supabaseUrl, publishableKey, 'products?select=id,updated_at&order=updated_at.desc'),
      fetchAllRows(supabaseUrl, publishableKey, 'posts?select=id,updated_at&status=eq.published&order=updated_at.desc')
    ]);

    categories.forEach((category) => entries.push(urlEntry(siteUrl, `/categories/${encodeURIComponent(category.slug)}`, category.updated_at, '0.7', 'weekly')));
    brands.forEach((brand) => entries.push(urlEntry(siteUrl, `/brand/${encodeURIComponent(brand.slug)}`, brand.updated_at, '0.9', 'daily')));
    products.forEach((product) => entries.push(urlEntry(siteUrl, `/product/${encodeURIComponent(product.id)}`, product.updated_at, '0.8', 'weekly')));
    posts.forEach((post) => entries.push(urlEntry(siteUrl, `/post/${encodeURIComponent(post.id)}`, post.updated_at, '0.7', 'weekly')));
  } catch (error) {
    console.error('[BRANDSCOPE sitemap]', error.message);
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>'
  ].join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=86400');
  res.status(200).send(xml);
}
