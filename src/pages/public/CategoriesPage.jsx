import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Clapperboard,
  Cpu,
  GraduationCap,
  HeartPulse,
  LayoutGrid,
  Plane,
  Search,
  Shapes,
  Shirt,
  ShoppingBag,
  Sparkles,
  Truck,
  UtensilsCrossed,
} from 'lucide-react';
import { dataStore } from '../../services/dataStore';
import { Seo } from '../../components/common/Seo';
import { useDataStoreVersion } from '../../hooks/useDataStoreVersion';

const categoryIcons = {
  technology: Cpu,
  'fashion-and-apparel': Shirt,
  'food-and-beverage': UtensilsCrossed,
  'beauty-and-personal-care': Sparkles,
  'real-estate': Building2,
  'finance-and-professional-services': BriefcaseBusiness,
  'health-and-wellness': HeartPulse,
  'education-and-training': GraduationCap,
  'media-and-entertainment': Clapperboard,
  'travel-and-hospitality': Plane,
  'retail-and-ecommerce': ShoppingBag,
  'logistics-and-transportation': Truck,
  'other-businesses': Shapes,
};

export const CategoriesPage = () => {
  useDataStoreVersion();
  const categories = dataStore.categories;
  const listedBrands = categories.reduce((total, category) => total + (category.brandCount || 0), 0);

  return (
    <main className="public-page categories-page">
      <Seo
        title="Business Categories"
        description="Explore BRANDSCOPE businesses by industry, sector, and commercial category."
        canonicalPath="/categories"
      />

      <section className="public-hero public-hero--categories">
        <div className="container public-hero-layout">
          <div className="public-hero-content">
            <span className="public-hero-kicker"><LayoutGrid size={14} /> Industry directory</span>
            <h1>Find brands by the work they do.</h1>
            <p>Move directly into the sectors that matter to you—from technology and retail to logistics, professional services, and emerging makers.</p>
            <div className="public-hero-meta">
              <span><LayoutGrid size={15} /><strong>{categories.length}</strong> commercial categories</span>
              <span><Building2 size={15} /><strong>{listedBrands}</strong> active brand listings</span>
            </div>
          </div>
          <div className="public-hero-orbit" aria-hidden="true">
            <span><Search size={22} /></span>
            <span><Building2 size={20} /></span>
            <span><Sparkles size={19} /></span>
            <div><strong>Explore</strong><small>by industry</small></div>
          </div>
        </div>
      </section>

      <section className="public-section categories-directory">
        <div className="container">
          <div className="public-section-heading">
            <div>
              <span className="section-eyebrow">Commercial sectors</span>
              <h2>Explore every industry</h2>
              <p>Each category leads to a focused directory of brands, products, and public business profiles.</p>
            </div>
            <Link to="/discover" className="public-text-link">Search the full directory <ArrowRight size={15} /></Link>
          </div>

          <div className="category-directory-grid">
            {categories.map((category, index) => {
              const Icon = categoryIcons[category.slug] || Building2;
              return (
                <Link key={category.id} to={`/categories/${category.slug}`} className="category-directory-card">
                  <div className="category-card-topline">
                    <span className="category-card-icon"><Icon size={22} /></span>
                    <span className="category-card-index">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="category-card-copy">
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </div>
                  <div className="category-card-footer">
                    <span><strong>{category.brandCount || 0}</strong> {category.brandCount === 1 ? 'brand' : 'brands'} listed</span>
                    <span>View category <ArrowRight size={14} /></span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container public-inline-cta">
        <div>
          <span className="section-eyebrow section-eyebrow--light">Built for real businesses</span>
          <h2>Do not see your exact niche?</h2>
          <p>List your brand under the closest commercial category. The directory grows with the businesses that join it.</p>
        </div>
        <Link to="/signup" className="btn btn-primary">Create your brand profile <ArrowRight size={16} /></Link>
      </section>
    </main>
  );
};

export default CategoriesPage;
