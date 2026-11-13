import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BrandCard } from '../../components/brand/BrandCard';
import { EmptyState } from '../../components/common/EmptyState';
import { SelectField } from '../../components/common/SelectField';
import { dataStore } from '../../services/dataStore';
import { useDataStoreVersion } from '../../hooks/useDataStoreVersion';
import { Search, Building2, X, ShoppingBag, SlidersHorizontal, MapPin, ArrowDownAZ } from 'lucide-react';

export const DiscoverPage = () => {
  const storeVersion = useDataStoreVersion();
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
  }, [storeVersion]);

  const cities = useMemo(() => {
    const set = new Set(dataStore.brands.map((b) => b.city).filter(Boolean));
    return Array.from(set);
  }, [storeVersion]);

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
  }, [selectedCategory, selectedCountry, selectedCity, search, hasProductsOnly, sortBy, storeVersion]);

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
    <div className="discover-page">
      <section className="discover-hero">
        <div className="container">
          <div className="discover-hero-content">
            <span className="discover-hero-kicker"><Search size={14} /> Business directory</span>
            <h1>Discover Commercial Brands</h1>
            <p>
              Explore companies, startups, makers, service providers, and direct digital storefronts across Nigeria and globally.
            </p>
          </div>
        </div>
      </section>

      <div className="container discover-content">
        <div className="discover-filter-card">
          <div className="discover-filter-heading">
            <div><SlidersHorizontal size={17} /><span>Refine discovery</span></div>
            {hasActiveFilters && <button type="button" onClick={resetFilters}><X size={15} /> Clear filters</button>}
          </div>
          <div className="discover-filter-grid">
            <label className="discover-filter-field discover-search-field">
              <span>Search directory</span>
              <div className="discover-control-wrap"><Search size={17} />
              <input
                type="text"
                className="form-input"
                placeholder="Search brands, products, or locations..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  updateFilters({ search: e.target.value });
                }}
              />
              </div>
            </label>

            <div className="discover-filter-field">
              <span>Industry</span>
              <SelectField
                value={selectedCategory}
                ariaLabel="Filter by industry"
                options={[
                  { value: '', label: 'All Categories' },
                  ...dataStore.categories.map((category) => ({ value: category.slug, label: category.name }))
                ]}
                onChange={(nextValue) => {
                  setSelectedCategory(nextValue);
                  updateFilters({ category: nextValue });
                }}
              />
            </div>

            <div className="discover-filter-field">
              <span><MapPin size={13} /> Location hub</span>
              <SelectField
                value={selectedCity}
                ariaLabel="Filter by location hub"
                options={[
                  { value: '', label: 'All Cities / Hubs' },
                  ...cities.map((city) => ({ value: city, label: city }))
                ]}
                onChange={(nextValue) => {
                  setSelectedCity(nextValue);
                  updateFilters({ city: nextValue });
                }}
              />
            </div>

            <div className="discover-filter-field">
              <span><ArrowDownAZ size={13} /> Sort results</span>
              <SelectField
                value={sortBy}
                ariaLabel="Sort discovery results"
                options={[
                  { value: 'popular', label: 'Most Followed' },
                  { value: 'newest', label: 'Recently Joined' },
                  { value: 'name', label: 'Alphabetical' }
                ]}
                onChange={setSortBy}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !hasProductsOnly;
                setHasProductsOnly(next);
                updateFilters({ hasProducts: next ? 'true' : '' });
              }}
              className={`discover-catalog-toggle ${hasProductsOnly ? 'is-active' : ''}`}
            >
              <span className="discover-catalog-icon"><ShoppingBag size={17} /></span>
              <span><strong>With catalog</strong><small>Show brands selling products or services</small></span>
            </button>
          </div>
        </div>

        <div className="discover-results-header">
          <div>
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
          <div className="discover-load-more">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 9)}
              className="btn btn-outline"
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
