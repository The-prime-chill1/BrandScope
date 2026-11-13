import React from 'react';
import { Link } from 'react-router-dom';
import { dataStore } from '../../services/dataStore';
import { Building2, ArrowRight, Sparkles } from 'lucide-react';

export const CategoriesPage = () => {
  const categories = dataStore.categories;

  return (
    <div style={{ paddingBottom: 'var(--space-16)' }}>
      {/* Header */}
      <section
        style={{
          backgroundColor: 'var(--color-navy)',
          color: '#FFFFFF',
          padding: 'var(--space-12) 0',
          marginBottom: 'var(--space-10)'
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '640px' }}>
            <span
              style={{
                display: 'inline-block',
                color: '#60A5FA',
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px'
              }}
            >
              Industry Directory
            </span>
            <h1 style={{ color: '#FFFFFF', fontSize: '2.5rem', marginBottom: '10px' }}>
              Brand Categories
            </h1>
            <p style={{ color: '#CBD5E1', fontSize: '1.1rem' }}>
              Browse businesses by specialized industry, sector, and commercial category.
            </p>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="grid-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categories/${cat.slug}`}
              className="card card-interactive"
              style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-blue-subtle)',
                  color: 'var(--color-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-4)'
                }}
              >
                <Building2 size={24} />
              </div>

              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '8px' }}>
                {cat.name}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', flex: 1, marginBottom: 'var(--space-5)' }}>
                {cat.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 'var(--space-3)',
                  borderTop: '1px solid var(--color-divider)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-blue)'
                }}
              >
                <span>{cat.brandCount} Brands Listed</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>View Brands</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
