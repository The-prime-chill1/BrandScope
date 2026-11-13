import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, LayoutGrid, Search } from 'lucide-react';
import { dataStore } from '../../services/dataStore';
import { BrandCard } from '../../components/brand/BrandCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Seo } from '../../components/common/Seo';
import { useDataStoreVersion } from '../../hooks/useDataStoreVersion';

export const CategoryDetailPage = () => {
  useDataStoreVersion();
  const { slug } = useParams();
  const category = dataStore.categories.find((item) => item.slug === slug);
  const brands = dataStore.getBrands({ category: slug, limit: 50 });

  if (!category) {
    return (
      <main className="public-not-found">
        <div className="public-not-found-icon"><LayoutGrid size={26} /></div>
        <span className="section-eyebrow">Directory notice</span>
        <h1>Category not found</h1>
        <p>The requested commercial category does not exist or may have moved.</p>
        <Link to="/categories" className="btn btn-primary"><ArrowLeft size={16} /> Back to categories</Link>
      </main>
    );
  }

  return (
    <main className="public-page category-detail-page">
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

      <section className="public-hero public-hero--compact">
        <div className="container">
          <Link to="/categories" className="public-back-link"><ArrowLeft size={15} /> All categories</Link>
          <div className="category-detail-hero-row">
            <div className="public-hero-content">
              <span className="public-hero-kicker"><LayoutGrid size={14} /> Industry collection</span>
              <h1>{category.name}</h1>
              <p>{category.description}</p>
            </div>
            <div className="category-detail-count">
              <span><Building2 size={20} /></span>
              <strong>{brands.length}</strong>
              <small>{brands.length === 1 ? 'business listed' : 'businesses listed'}</small>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section category-results-section">
        <div className="container">
          <div className="public-section-heading public-section-heading--compact">
            <div>
              <span className="section-eyebrow">Directory results</span>
              <h2>Brands in {category.name}</h2>
            </div>
            <Link to={`/discover?category=${category.slug}`} className="public-text-link"><Search size={15} /> Refine this search</Link>
          </div>

          {brands.length === 0 ? (
            <div className="category-empty-wrap">
              <EmptyState
                icon={Building2}
                title={`No brands in ${category.name} yet`}
                description="Be the first business to establish a public brand profile in this category."
                actionLabel="List your brand"
                actionLink="/signup"
              />
            </div>
          ) : (
            <div className="grid-3">
              {brands.map((brand) => <BrandCard key={brand.id} brand={brand} />)}
            </div>
          )}

          <div className="category-results-footer">
            <span>Looking beyond this sector?</span>
            <Link to="/discover">Explore every listed brand <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CategoryDetailPage;
