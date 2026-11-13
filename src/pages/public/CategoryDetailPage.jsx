import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { dataStore } from '../../services/dataStore';
import { BrandCard } from '../../components/brand/BrandCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Seo } from '../../components/common/Seo';
import { ArrowLeft, Building2 } from 'lucide-react';

export const CategoryDetailPage = () => {
  const { slug } = useParams();
  const category = dataStore.categories.find((c) => c.slug === slug);
  const brands = dataStore.getBrands({ category: slug, limit: 50 });

  if (!category) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
        <h2>Category Not Found</h2>
        <p style={{ marginTop: '8px', marginBottom: '24px' }}>The requested brand category does not exist.</p>
        <Link to="/categories" className="btn btn-primary">Back to Categories</Link>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 'var(--space-16)' }}>
      <Seo
        title={`${category.name} Brands`}
        description={category.description}
        canonicalPath={`/categories/${category.slug}`}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${category.name} Brands on BRANDSCOPE`,
          description: category.description,
          isPartOf: { '@type': 'WebSite', name: 'BRANDSCOPE' }
        }}
      />
      {/* Header */}
      <section
        style={{
          backgroundColor: 'var(--color-navy)',
          color: '#FFFFFF',
          padding: 'var(--space-10) 0',
          marginBottom: 'var(--space-8)'
        }}
      >
        <div className="container">
          <Link
            to="/categories"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#93C5FD',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: 'var(--space-3)'
            }}
          >
            <ArrowLeft size={16} />
            <span>All Categories</span>
          </Link>
          <h1 style={{ color: '#FFFFFF', fontSize: '2.4rem', marginBottom: '8px' }}>
            {category.name}
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '1.05rem', maxWidth: '600px' }}>
            {category.description}
          </p>
        </div>
      </section>

      <div className="container">
        <div style={{ marginBottom: 'var(--space-6)', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Showing <strong>{brands.length}</strong> businesses in {category.name}
        </div>

        {brands.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={`No brands in ${category.name} yet`}
            description="Be the first business to establish a brand profile in this category."
            actionLabel="List Your Brand"
            actionLink="/signup"
          />
        ) : (
          <div className="grid-3">
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDetailPage;
