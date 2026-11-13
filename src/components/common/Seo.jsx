import { useEffect } from 'react';
import { getSiteOrigin } from '../../lib/site';

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function removeMeta(selector) {
  document.head.querySelector(selector)?.remove();
}

export const Seo = ({
  title,
  description,
  canonicalPath = '/',
  image = '',
  schema = null,
  type = 'website',
  noIndex = false
}) => {
  useEffect(() => {
    const origin = getSiteOrigin();
    const canonicalUrl = `${origin}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
    const fullTitle = title.includes('BRANDSCOPE') ? title : `${title} | BRANDSCOPE`;
    const resolvedImage = image ? new URL(image, `${origin}/`).href : '';

    document.title = fullTitle;
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'
    });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'BRANDSCOPE' });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: resolvedImage ? 'summary_large_image' : 'summary' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    if (resolvedImage) {
      upsertMeta('meta[property="og:image"]', { property: 'og:image', content: resolvedImage });
      upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: resolvedImage });
    } else {
      removeMeta('meta[property="og:image"]');
      removeMeta('meta[name="twitter:image"]');
    }

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const schemaId = 'brandscope-page-schema';
    document.getElementById(schemaId)?.remove();
    if (schema) {
      const script = document.createElement('script');
      script.id = schemaId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    return () => document.getElementById(schemaId)?.remove();
  }, [canonicalPath, description, image, noIndex, schema, title, type]);

  return null;
};

export default Seo;
