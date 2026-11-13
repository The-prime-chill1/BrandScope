import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandCard } from '../../components/brand/BrandCard';
import { PostCard } from '../../components/posts/PostCard';
import { dataStore } from '../../services/dataStore';
import { useDataStoreVersion } from '../../hooks/useDataStoreVersion';
import {
  Search,
  ArrowRight,
  Globe2,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Cpu,
  Shirt,
  Coffee,
  Briefcase,
  Heart,
  GraduationCap,
  Film,
  ShoppingBag,
  Truck,
  Compass,
  MessageCircle
} from 'lucide-react';

const CATEGORY_ICONS = {
  technology: Cpu,
  'fashion-and-apparel': Shirt,
  'food-and-beverage': Coffee,
  'real-estate': Building2,
  'beauty-and-personal-care': Heart,
  'education-and-training': GraduationCap,
  'health-and-wellness': Heart,
  'finance-and-professional-services': Briefcase,
  'media-and-entertainment': Film,
  'travel-and-hospitality': Compass,
  'retail-and-ecommerce': ShoppingBag,
  'logistics-and-transportation': Truck,
  'other-businesses': Globe2
};

export const HomePage = () => {
  useDataStoreVersion();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const recentBrands = dataStore.getBrands({ limit: 8 });
  const recentPosts = dataStore.getPosts({ limit: 3 });
  const categories = dataStore.categories.slice(0, 8);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/discover?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/discover');
    }
  };

  return (
    <div className="home-page">
      {/* ═══════════════════════════════════════════
          HERO — Split layout, left-aligned text
          ═══════════════════════════════════════════ */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-content">
              <p className="hero-eyebrow">Global Brand Discovery Platform</p>
              <h1 className="hero-title">
                Where Brands<br />
                Get <span className="hero-title-accent">Discovered</span>.
              </h1>
              <p className="hero-desc">
                Create your business profile, share your story, and reach new audiences 
                across industries and borders — on a platform built exclusively for brands.
              </p>

              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="hero-search">
                <Search size={18} className="hero-search-icon" />
                <input
                  type="text"
                  placeholder="Search by name, industry, or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="hero-search-input"
                />
                <button type="submit" className="hero-search-btn">Search</button>
              </form>

              <div className="hero-actions">
                <Link to="/signup" className="btn btn-primary btn-lg">
                  List Your Brand
                  <ArrowRight size={17} />
                </Link>
                <Link to="/discover" className="btn btn-outline-light btn-lg">
                  Explore Brands
                </Link>
              </div>
            </div>

            {/* Right side — Stats / social proof */}
            <div className="hero-visual">
              <div className="home-hero-showcase">
                <div className="home-hero-showcase-head">
                  <span><ShieldCheck size={15} /> Member-published directory</span>
                  <small>{recentBrands.length ? 'Recently listed' : 'Opening for brands'}</small>
                </div>

                {recentBrands.length > 0 ? (
                  <div className="home-hero-brand-list">
                    {recentBrands.slice(0, 3).map((brand) => (
                      <Link to={`/brand/${brand.slug}`} className="home-hero-brand-row" key={brand.id}>
                        {brand.logoUrl ? (
                          <img src={brand.logoUrl} alt="" />
                        ) : (
                          <span className="home-hero-brand-fallback">{brand.name?.charAt(0)?.toUpperCase() || 'B'}</span>
                        )}
                        <span className="home-hero-brand-copy">
                          <strong>{brand.name}</strong>
                          <small>{brand.category}{brand.city ? ` · ${brand.city}` : ''}</small>
                        </span>
                        <ArrowRight size={16} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="home-hero-showcase-empty">
                    <Building2 size={34} />
                    <strong>The directory starts with its members.</strong>
                    <p>No sample brands or paid placements. Real business profiles will appear here as their owners join.</p>
                  </div>
                )}

                <Link to={recentBrands.length ? '/discover' : '/signup'} className="home-hero-showcase-link">
                  {recentBrands.length ? 'Explore every brand' : 'Publish your brand first'} <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MEMBER-PUBLISHED DIRECTORY
          ═══════════════════════════════════════════ */}
      <section className="home-section home-brand-showcase-section">
        <div className="container">
          <div className="home-section-top">
            <div>
              <span className="section-eyebrow">The directory comes first</span>
              <h2>Discover businesses, not advertisements.</h2>
              <p>Every profile below is created and maintained by the brand itself.</p>
            </div>
            {recentBrands.length > 0 && (
              <Link to="/discover" className="home-section-link">View all brands <ArrowRight size={15} /></Link>
            )}
          </div>

          {recentBrands.length > 0 ? (
            <div className="home-brand-grid home-brand-grid--4">
              {recentBrands.slice(0, 4).map((brand) => <BrandCard key={brand.id} brand={brand} />)}
            </div>
          ) : (
            <div className="launch-empty-state">
              <div className="launch-empty-icon"><Building2 size={28} /></div>
              <div>
                <span className="section-eyebrow">No brands listed yet</span>
                <h2>Be the first business people discover.</h2>
                <p>BRANDSCOPE does not use sample listings. This space will fill only with profiles published by real business owners.</p>
              </div>
              <Link to="/signup" className="btn btn-primary">Create your brand profile <ArrowRight size={15} /></Link>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          EXPLORE CATEGORIES — Asymmetric grid
          ═══════════════════════════════════════════ */}
      <section className="home-section">
        <div className="container">
          <div className="home-section-top">
            <div>
              <h2>Explore by Industry</h2>
              <p>Find brands across every sector.</p>
            </div>
            <Link to="/categories" className="home-section-link">
              All categories <ArrowRight size={15} />
            </Link>
          </div>
          <div className="home-cat-grid">
            {categories.map((cat) => {
              const IconComponent = CATEGORY_ICONS[cat.slug] || Building2;
              return (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.slug}`}
                  className="home-cat-card"
                >
                  <div className="home-cat-icon">
                    <IconComponent size={20} />
                  </div>
                  <div className="home-cat-info">
                    <h4>{cat.name}</h4>
                    <span className="home-cat-count">{cat.brandCount} brands</span>
                  </div>
                  <ArrowRight size={16} className="home-cat-arrow" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — Horizontal steps
          ═══════════════════════════════════════════ */}
      <section className="home-section home-section--surface">
        <div className="container">
          <div className="home-section-top home-section-top--center">
            <div>
              <h2>How BRANDSCOPE Works</h2>
              <p>Three steps to grow your brand's visibility.</p>
            </div>
          </div>
          <div className="home-steps">
            <div className="home-step">
              <span className="home-step-num">01</span>
              <h3>Create Your Profile</h3>
              <p>
                Claim your unique brand page with your logo, description, 
                products, and verified contact details.
              </p>
            </div>
            <div className="home-step-divider" />
            <div className="home-step">
              <span className="home-step-num">02</span>
              <h3>Publish Updates</h3>
              <p>
                Share company news, product launches, and milestones. 
                Engage with other businesses through follows and comments.
              </p>
            </div>
            <div className="home-step-divider" />
            <div className="home-step">
              <span className="home-step-num">03</span>
              <h3>Get Discovered</h3>
              <p>
                Appear in searches and category listings, then reach new clients and partners through content you publish yourself.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          LATEST POSTS — Left-aligned header
          ═══════════════════════════════════════════ */}
      {recentPosts.length > 0 && (
        <section className="home-section">
          <div className="container">
            <div className="home-section-top">
              <div>
                <h2>Latest from Brands</h2>
                <p>Announcements and updates published by businesses on the platform.</p>
              </div>
              <Link to="/feed" className="home-section-link">
                Open feed <ArrowRight size={15} />
              </Link>
            </div>
            <div className="home-posts-col">
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          RECENTLY JOINED — Browse new brands
          ═══════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════
          TRUST & SECURITY BANNER
          ═══════════════════════════════════════════ */}
      <section className="home-trust">
        <div className="container">
          <div className="home-trust-inner">
            <div className="home-trust-content">
              <h3>Built for Serious Businesses</h3>
              <p>
                BRANDSCOPE operates under strict business-only registration. 
                Registration is reserved for companies, startups, makers, and commercial 
                brands. Verification is editorial — it cannot be purchased.
              </p>
            </div>
            <div className="home-trust-badges">
              <div className="home-trust-item">
                <CheckCircle2 size={18} />
                <span>Identity Verification</span>
              </div>
              <div className="home-trust-item">
                <CheckCircle2 size={18} />
                <span>Content Moderation</span>
              </div>
              <div className="home-trust-item">
                <MessageCircle size={18} />
                <span>Direct WhatsApp Contact</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA — Minimal
          ═══════════════════════════════════════════ */}
      <section className="home-cta">
        <div className="container">
          <div className="home-cta-inner">
            <h2>Ready to grow your brand?</h2>
            <p>Create your free profile and start getting discovered today.</p>
            <div className="home-cta-actions">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Get Started
                <ArrowRight size={17} />
              </Link>
              <Link to="/discover" className="btn btn-outline-light btn-lg">
                Browse Brands
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
