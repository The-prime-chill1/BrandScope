import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe2,
  MessageCircle,
  Package,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { dataStore } from '../../services/dataStore';
import { Seo } from '../../components/common/Seo';
import { VerificationBadge } from '../../components/common/Badge';

const AVAILABILITY = {
  in_stock: { label: 'Available', schema: 'https://schema.org/InStock' },
  out_of_stock: { label: 'Out of stock', schema: 'https://schema.org/OutOfStock' },
  preorder: { label: 'Pre-order', schema: 'https://schema.org/PreOrder' },
  service: { label: 'Service', schema: 'https://schema.org/OnlineOnly' }
};

export const ProductDetailPage = () => {
  const { productId } = useParams();
  const record = dataStore.getProductById(productId);

  if (!record) {
    return (
      <div className="container product-not-found">
        <Package size={42} />
        <h1>Catalog item not found</h1>
        <p>This product or service may have been removed by its brand.</p>
        <Link to="/discover" className="btn btn-primary">Discover brands</Link>
      </div>
    );
  }

  const { product, brand } = record;
  const origin = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '');
  const canonicalUrl = `${origin}/product/${product.id}`;
  const brandUrl = `${origin}/brand/${brand.slug}`;
  const availability = AVAILABILITY[product.availability] || AVAILABILITY.in_stock;
  const cleanPhone = (brand.whatsapp || brand.phone || '').replace(/[^0-9]/g, '');
  const whatsappText = `Hello ${brand.name}, I am interested in "${product.title}" ($${Number(product.price || 0).toLocaleString('en-US')} USD) published on BRANDSCOPE: ${canonicalUrl}`;
  const specifications = Object.entries(product.specifications || {}).filter(([, value]) => value !== '' && value != null);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || `${product.title} from ${brand.name}`,
    image: product.imageUrl || undefined,
    url: canonicalUrl,
    sku: product.id,
    brand: {
      '@type': 'Organization',
      name: brand.name,
      url: brandUrl,
      logo: brand.logoUrl || undefined
    },
    offers: {
      '@type': 'Offer',
      price: Number(product.price || 0).toFixed(2),
      priceCurrency: 'USD',
      availability: availability.schema,
      url: canonicalUrl,
      seller: { '@type': 'Organization', name: brand.name, url: brandUrl }
    },
    mainEntityOfPage: canonicalUrl,
    isPartOf: { '@type': 'WebSite', name: 'BRANDSCOPE', url: origin }
  };

  return (
    <div className="product-detail-page">
      <Seo
        title={`${product.title} by ${brand.name}`}
        description={product.description || `Discover ${product.title} from ${brand.name} on BRANDSCOPE.`}
        canonicalPath={`/product/${product.id}`}
        image={product.imageUrl || brand.coverUrl || brand.logoUrl}
        schema={productSchema}
        type="product"
      />

      <div className="container product-detail-container">
        <Link to={`/brand/${brand.slug}`} className="product-back-link">
          <ArrowLeft size={16} /> Back to {brand.name}
        </Link>

        <div className="source-attribution">
          <div className="source-attribution-icon"><Globe2 size={19} /></div>
          <div>
            <span>Source: BRANDSCOPE</span>
            <strong>Originally published by {brand.name} on BRANDSCOPE</strong>
          </div>
        </div>

        <article className="product-detail-card">
          <div className="product-detail-media">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.title} />
            ) : (
              <div className="product-detail-placeholder"><Package size={54} /></div>
            )}
          </div>

          <div className="product-detail-content">
            <div className="product-brand-line">
              {brand.logoUrl ? <img src={brand.logoUrl} alt="" /> : <span>{brand.name.charAt(0)}</span>}
              <Link to={`/brand/${brand.slug}`}>{brand.name}</Link>
              {brand.verificationStatus === 'verified' && <VerificationBadge size={13} />}
            </div>

            {product.badge && <span className="catalog-label">{product.badge}</span>}
            <h1>{product.title}</h1>
            <div className="product-detail-price">
              ${Number(product.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span>USD</span>
            </div>

            <div className={`product-availability product-availability--${product.availability}`}>
              <CheckCircle2 size={15} /> {availability.label}
            </div>

            <p className="product-detail-description">
              {product.description || 'Contact the brand directly for full product or service details.'}
            </p>

            <div className="product-detail-meta">
              {product.leadTime && <span><Clock size={16} /> {product.leadTime}</span>}
              {brand.deliveryInfo && <span><Truck size={16} /> {brand.deliveryInfo}</span>}
            </div>

            <div className="product-detail-actions">
              {cleanPhone && (
                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn product-whatsapp-btn"
                >
                  <MessageCircle size={17} /> Order or inquire on WhatsApp
                </a>
              )}
              {brand.website && (
                <a href={brand.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  Visit brand website <ExternalLink size={15} />
                </a>
              )}
            </div>
          </div>
        </article>

        {specifications.length > 0 && (
          <section className="product-specifications">
            <div className="product-section-heading">
              <ShieldCheck size={18} />
              <div><span>Item details</span><h2>Specifications</h2></div>
            </div>
            <dl>
              {specifications.map(([key, value]) => (
                <div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>
              ))}
            </dl>
          </section>
        )}

        <section className="post-source-footer product-source-footer">
          <Building2 size={20} />
          <div>
            <strong>Published on BRANDSCOPE</strong>
            <p>This public permalink is included in BRANDSCOPE discovery metadata and the live sitemap so search engines can find the brand’s catalog.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetailPage;
