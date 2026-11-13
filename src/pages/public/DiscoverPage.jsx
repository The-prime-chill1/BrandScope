import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BrandCard } from '../../components/brand/BrandCard';
import { EmptyState } from '../../components/common/EmptyState';
import { dataStore } from '../../services/dataStore';
import { Search, Building2, X, ShoppingBag } from 'lucide-react';

export const DiscoverPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialCountry = searchParams.get('country') || '';
  const initialCity = searchParams.get('city') || '';
  const initialHasProducts = searchParams.get('hasProducts') === 'true';

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [hasProductsOnly, setHasProductsOnly] = useState(initialHasProducts);
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'newest', 'name'
  const [visibleCount, setVisibleCount] = useState(9);

  // Sync state with URL params
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedCountry(searchParams.get('country') || '');
    setSelectedCity(searchParams.get('city') || '');
    setHasProductsOnly(searchParams.get('hasProducts') === 'true');
  }, [searchParams]);

  const updateFilters = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    setSearchParams(params);
  };

  const countries = useMemo(() => {
    const set = new Set(dataStore.brands.map((b) => b.country).filter(Boolean));
    return Array.from(set);
  }, []);

  const cities = useMemo(() => {
    const set = new Set(dataStore.brands.map((b) => b.city).filter(Boolean));
    return Array.from(set);
  }, []);

  const brands = useMemo(() => {
    let list = dataStore.getBrands({
      category: selectedCategory,
      country: selectedCountry,
      search,
      limit: 100
    });

    if (selectedCity) {
      list = list.filter((b) => b.city && b.city.toLowerCase() === selectedCity.toLowerCase());
    }

    if (hasProductsOnly) {
      list = list.filter((b) => b.products && b.products.length > 0);
    }

    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [selectedCategory, selectedCountry, selectedCity, search, hasProductsOnly, sortBy]);

  const visibleBrands = brands.slice(0, visibleCount);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedCountry('');
    setSelectedCity('');
    setHasProductsOnly(false);
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(search || selectedCategory || selectedCountry || selectedCity || hasProductsOnly);

  return (
    <div style={{ paddingBottom: 'var(--space-16)' }}>
      {/* Header Bar */}
      <section
        style={{
          backgroundColor: 'var(--color-navy)',
          color: '#FFFFFF',
          padding: 'var(--space-10) 0',
          marginBottom: 'var(--space-8)'
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '680px' }}>
            <h1 style={{ color: '#FFFFFF', fontSize: '2.4rem', marginBottom: '8px' }}>
              Discover Commercial Brands
            </h1>
            <p style={{ color: '#CBD5E1', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Explore companies, startups, makers, service providers, and direct digital storefronts across Nigeria and globally.
            </p>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Filter Controls Bar */}
        <div
          className="card"
          style={{
            padding: 'var(--space-5)',
            marginBottom: 'var(--space-8)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ flex: '2 1 240px', position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)'
                }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Search brands, products, or locations..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  updateFilters({ search: e.target.value });
                }}
                style={{ paddingLeft: '34px' }}
              />
            </div>

            {/* Category Dropdown */}
            <div style={{ flex: '1 1 170px' }}>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  updateFilters({ category: e.target.value });
                }}
              >
                <option value="">All Categories</option>
                {dataStore.categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City / State Hub Dropdown (Nigerian Hubs) */}
            <div style={{ flex: '1 1 150px' }}>
              <select
                className="form-select"
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  updateFilters({ city: e.target.value });
                }}
              >
                <option value="">All Cities / Hubs</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div style={{ flex: '1 1 140px' }}>
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Most Followed</option>
                <option value="newest">Recently Joined</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>

            {/* Has Products / Storefront Filter */}
            <button
              type="button"
              onClick={() => {
                const next = !hasProductsOnly;
                setHasProductsOnly(next);
                updateFilters({ hasProducts: next ? 'true' : '' });
              }}
              className={`btn btn-sm ${hasProductsOnly ? 'btn-primary' : 'btn-outline'}`}
              style={{ gap: '6px', padding: '9px 12px', fontSize: '0.825rem' }}
            >
              <ShoppingBag size={14} />
              <span>With Catalog</span>
            </button>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-ghost btn-sm"
                style={{ padding: '8px 12px', gap: '4px', fontSize: '0.825rem' }}
                title="Clear all filters"
              >
                <X size={15} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-6)'
          }}
        >
          <div style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
            Showing <strong>{visibleBrands.length}</strong> of <strong>{brands.length}</strong> businesses
          </div>
        </div>

        {/* Brand Grid or Empty State */}
        {brands.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No businesses found"
            description="We could not find any brands matching your search and filter parameters. Try broadening your keywords."
            actionLabel="Clear all filters"
            onActionClick={resetFilters}
          />
        ) : (
          <div className="grid-3">
            {visibleBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        )}

        {/* Load More Pagination */}
        {visibleBrands.length < brands.length && (
          <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 9)}
              className="btn btn-outline"
              style={{ padding: '12px 32px' }}
            >
              Load More Brands
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
