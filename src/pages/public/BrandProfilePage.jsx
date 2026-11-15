import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dataStore } from '../../services/dataStore';
import { useAuth } from '../../contexts/AuthContext';
import { VerificationBadge } from '../../components/common/Badge';
import { PostCard } from '../../components/posts/PostCard';
import { PostCreator } from '../../components/posts/PostCreator';
import { ShareModal } from '../../components/brand/ShareModal';
import { ReportModal } from '../../components/brand/ReportModal';
import { EmptyState } from '../../components/common/EmptyState';
import { Seo } from '../../components/common/Seo';
import { useToast } from '../../contexts/ToastContext';
import { getSiteOrigin } from '../../lib/site';
import { createPhoneUrl, createWhatsAppUrl } from '../../lib/contact';
import { useDataStoreVersion } from '../../hooks/useDataStoreVersion';
import { 
  Globe, 
  MapPin, 
  Calendar, 
  Users, 
  UserPlus, 
  Check, 
  Share2, 
  Flag, 
  Edit3, 
  ExternalLink, 
  FileText, 
  Info,
  ShoppingBag,
  MessageCircle,
  Phone,
  Mail,
  ShieldCheck,
  Clock,
  Truck,
  CheckCircle2,
  Tag,
  Search
} from 'lucide-react';

export const BrandProfilePage = () => {
  const storeVersion = useDataStoreVersion();
  const { slug } = useParams();
  const { user, currentBrand } = useAuth();
  const { addToast } = useToast();

  const brand = dataStore.getBrandBySlug(slug);
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'posts' | 'about'
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const [following, setFollowing] = useState(
    user && brand ? dataStore.isFollowing(brand.id, user.uid) : false
  );
  const [followerCount, setFollowerCount] = useState(brand ? brand.followerCount || 0 : 0);
  const [posts, setPosts] = useState(brand ? dataStore.getPosts({ brandId: brand.id }) : []);
  const origin = getSiteOrigin();

  useEffect(() => {
    if (!brand) return;
    setFollowing(Boolean(user && dataStore.isFollowing(brand.id, user.uid)));
    setFollowerCount(brand.followerCount || 0);
    setPosts(dataStore.getPosts({ brandId: brand.id }));
  }, [brand, storeVersion, user]);

  const organizationSchema = useMemo(() => brand ? {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    description: brand.shortDescription,
    url: `${origin}/brand/${brand.slug}`,
    logo: brand.logoUrl || undefined,
    image: brand.coverUrl || brand.logoUrl || undefined,
    address: brand.city || brand.country ? {
      '@type': 'PostalAddress',
      addressLocality: brand.city || undefined,
      addressCountry: brand.country || undefined
    } : undefined,
    email: brand.contactEmail || undefined,
    sameAs: [brand.website, brand.whatsapp, ...Object.values(brand.socials || {})].filter(Boolean),
    contactPoint: (brand.contactEmail || brand.phone || brand.whatsapp) ? {
      '@type': 'ContactPoint',
      email: brand.contactEmail || undefined,
      telephone: brand.phone || undefined,
      contactType: 'customer service'
    } : undefined,
    parentOrganization: { '@type': 'Organization', name: 'BRANDSCOPE', url: origin }
  } : null, [brand, origin, storeVersion]);

  if (!brand) {
    if (!dataStore.initialized) {
      return <div className="workspace-loading"><span className="workspace-loading-mark" />Loading this brand profile...</div>;
    }
    return (
      <div className="container" style={{ padding: 'var(--space-20) 0', textAlign: 'center' }}>
        <h2>Brand Profile Not Found</h2>
        <p style={{ marginTop: '8px', marginBottom: '24px' }}>
          The brand profile you are looking for does not exist or may have been suspended.
        </p>
        <Link to="/discover" className="btn btn-primary">
          Explore Other Brands
        </Link>
      </div>
    );
  }

  const isOwner = user && user.uid === brand.ownerUid;
  const products = brand.products || [];
  const hasWhatsApp = Boolean(createWhatsAppUrl(brand.whatsapp));

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase())) ||
    (p.badge && p.badge.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const handleFollowToggle = async () => {
    if (!user) {
      addToast('Please sign in with a brand to follow businesses.', 'info');
      return;
    }
    if (user.uid === brand.ownerUid) {
      addToast('You cannot follow your own brand.', 'error');
      return;
    }

    try {
      const res = await dataStore.toggleFollow(
        brand.id,
        user.uid,
        currentBrand ? currentBrand.name : 'A Brand'
      );
      setFollowing(res.isFollowing);
      setFollowerCount(res.followerCount);
      addToast(
        res.isFollowing ? `Now following ${brand.name}` : `Unfollowed ${brand.name}`,
        'success'
      );
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const createWhatsAppInquiry = (productTitle, productPrice) => {
    const text = productTitle
      ? `Hello ${brand.name}, I am inquiring about "${productTitle}" ($${Number(productPrice || 0).toLocaleString()} USD) seen on BRANDSCOPE: ${origin}/brand/${brand.slug}`
      : `Hello ${brand.name}, I found your business profile on BRANDSCOPE (${origin}/brand/${brand.slug}) and would like to make an inquiry.`;
    return createWhatsAppUrl(brand.whatsapp, text);
  };

  return (
    <div className="brand-profile-page">
      <Seo
        title={`${brand.name} — ${brand.category}`}
        description={brand.shortDescription || `Discover ${brand.name} on BRANDSCOPE.`}
        canonicalPath={`/brand/${brand.slug}`}
        image={brand.coverUrl || brand.logoUrl}
        schema={organizationSchema}
        type="profile"
      />
      {/* Brand Hero Cover */}
      <div
        className="brand-profile-cover"
        style={{
          backgroundColor: 'var(--color-navy-surface)',
          backgroundImage: brand.coverUrl ? `url(${brand.coverUrl})` : 'linear-gradient(135deg, #10243A 0%, #3157D5 55%, #1BC7D2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(16, 36, 58, 0.2) 0%, rgba(16, 36, 58, 0.75) 100%)'
          }}
        />

        <div className="container" style={{ position: 'relative', height: '100%' }} />
      </div>

      {/* Brand Profile Header & Details */}
      <div className="container brand-profile-container">
        <section className="brand-profile-summary">
          <div className="brand-profile-summary-main">
            {/* Left: Avatar & Identity */}
            <div className="brand-profile-identity">
              {brand.logoUrl ? <img
                src={brand.logoUrl}
                alt={brand.name}
                className="brand-profile-logo"
              /> : (
                <div className="brand-profile-logo-fallback">{brand.name?.charAt(0)?.toUpperCase() || 'B'}</div>
              )}

              <div className="brand-profile-identity-copy">
                <div className="brand-profile-title-row">
                  <h1>{brand.name}</h1>
                  {brand.verificationStatus === 'verified' && <VerificationBadge size={18} />}
                  {brand.cacNumber && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: '#ECFDF5',
                        color: '#065F46',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid #A7F3D0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ShieldCheck size={12} />
                      CAC: {brand.cacNumber}
                    </span>
                  )}
                </div>

                <div className="brand-profile-meta">
                  <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{brand.category}</span>
                  {brand.city && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={14} />
                      {brand.city}, {brand.country}
                    </span>
                  )}
                  {brand.responseSpeed && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#059669', fontWeight: 500 }}>
                      <Clock size={13} />
                      Replies {brand.responseSpeed}
                    </span>
                  )}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Calendar size={14} />
                    Joined {new Date(brand.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <p className="brand-profile-description">
                {brand.shortDescription}
              </p>

              {/* External Website & Socials */}
              <div className="brand-profile-links">
                  {brand.website ? (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-blue btn-sm"
                      style={{ gap: '6px', padding: '4px 10px', fontSize: '0.8rem' }}
                    >
                      <Globe size={13} />
                      <span>{brand.website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink size={11} />
                    </a>
                  ) : hasWhatsApp ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        backgroundColor: '#DCFCE7',
                        color: '#166534',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid #BBF7D0'
                      }}
                    >
                      <MessageCircle size={13} color="#16A34A" />
                      <span>WhatsApp Direct Storefront</span>
                    </span>
                  ) : null}
                  {brand.socials?.twitter && (
                    <a href={brand.socials.twitter} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--color-blue)' }}>
                      Twitter/X
                    </a>
                  )}
                  {brand.socials?.linkedin && (
                    <a href={brand.socials.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--color-blue)' }}>
                      LinkedIn
                    </a>
                  )}
                  {brand.socials?.instagram && (
                    <a href={brand.socials.instagram} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--color-blue)' }}>
                      Instagram
                    </a>
                  )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="brand-profile-actions">
              {/* WhatsApp Instant Commercial Inquiry (ShopSharp Pattern) */}
              {hasWhatsApp && (
                <a
                  href={createWhatsAppInquiry()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm brand-profile-whatsapp-action"
                  style={{
                    backgroundColor: '#25D366',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 600,
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)'
                  }}
                >
                  <MessageCircle size={15} />
                  <span>Chat on WhatsApp</span>
                </a>
              )}

              {isOwner ? (
                <Link to="/dashboard/profile" className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
                  <Edit3 size={15} />
                  <span>Edit Brand Profile</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  className={`btn btn-sm ${following ? 'btn-outline' : 'btn-primary'}`}
                  style={{ gap: '6px' }}
                >
                  {following ? (
                    <>
                      <Check size={15} />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={15} />
                      <span>Follow Brand</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="btn btn-outline btn-sm"
                style={{ gap: '6px' }}
                title="Share profile"
              >
                <Share2 size={15} />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="btn btn-ghost btn-sm brand-profile-report-action"
                title="Report brand"
                style={{ padding: '8px' }}
              >
                <Flag size={16} />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="brand-profile-metrics">
            <div>
              <strong style={{ color: 'var(--color-navy)', fontSize: '1.1rem' }}>{products.length}</strong>{' '}
              <span style={{ color: 'var(--color-text-secondary)' }}>Commercial Offerings</span>
            </div>
            <div>
              <strong style={{ color: 'var(--color-navy)', fontSize: '1.1rem' }}>{followerCount}</strong>{' '}
              <span style={{ color: 'var(--color-text-secondary)' }}>Followers</span>
            </div>
            <div>
              <strong style={{ color: 'var(--color-navy)', fontSize: '1.1rem' }}>{posts.length}</strong>{' '}
              <span style={{ color: 'var(--color-text-secondary)' }}>Published Posts</span>
            </div>
            {brand.deliveryInfo && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 600 }}>
                <Truck size={15} />
                <span>{brand.deliveryInfo}</span>
              </div>
            )}
          </div>
        </section>

        {/* Tab Switcher: Products vs Posts vs About */}
        <div className="brand-profile-tabs" role="tablist" aria-label="Brand profile sections">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`brand-profile-tab ${activeTab === 'products' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'products'}
          >
            <ShoppingBag size={16} />
            <span className="brand-profile-tab-label--desktop">Products & Showcase ({products.length})</span>
            <span className="brand-profile-tab-label--mobile">Products <b>{products.length}</b></span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`brand-profile-tab ${activeTab === 'posts' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'posts'}
          >
            <FileText size={16} />
            <span className="brand-profile-tab-label--desktop">Posts & Announcements ({posts.length})</span>
            <span className="brand-profile-tab-label--mobile">Posts <b>{posts.length}</b></span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`brand-profile-tab ${activeTab === 'about' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'about'}
          >
            <Info size={16} />
            <span className="brand-profile-tab-label--desktop">About & Credentials</span>
            <span className="brand-profile-tab-label--mobile">About</span>
          </button>
        </div>

        {/* Tab 1: Products & Digital Showcase (ShopSharp Instant Commerce Pattern) */}
        {activeTab === 'products' && (
          <div className="brand-profile-panel">
            <div className="brand-profile-panel-heading">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Commercial Catalog & Offerings</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  Browse authentic products & services. Click to connect directly with {brand.name} on WhatsApp.
                </p>
              </div>

              {products.length > 2 && (
                <div className="brand-profile-product-search">
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
                  />
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="No catalog items listed"
                description={productSearch ? 'No items matched your search query.' : `${brand.name} has not yet added commercial products or services.`}
              />
            ) : (
              <div className="grid-3" style={{ gap: '20px' }}>
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="card"
                    style={{
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border)',
                      transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
                    }}
                  >
                    {/* Product Image */}
                    <Link to={`/product/${p.id}`} style={{ height: '190px', position: 'relative', overflow: 'hidden', backgroundColor: '#F1F5F9', display: 'block' }}>
                      {p.imageUrl ? <img
                        src={p.imageUrl}
                        alt={p.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      /> : <ShoppingBag size={34} style={{ margin: '78px auto', color: 'var(--color-text-muted)' }} />}
                      {p.badge && (
                        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                          <span className="badge badge-primary" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                            {p.badge}
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Product Body */}
                    <div style={{ padding: 'var(--space-5)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <Link to={`/product/${p.id}`} style={{ color: 'inherit' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.3 }}>{p.title}</h4>
                        </Link>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                          ${Number(p.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>USD</span>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 16px 0', flex: 1 }}>
                        {p.description}
                      </p>

                      {p.leadTime && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#059669', marginBottom: '14px', fontWeight: 500 }}>
                          <Truck size={13} />
                          <span>{p.leadTime}</span>
                        </div>
                      )}

                      {/* Instant WhatsApp Order CTA */}
                      {hasWhatsApp ? (
                        <a
                          href={createWhatsAppInquiry(p.title, p.price)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-block btn-sm"
                          style={{
                            backgroundColor: '#25D366',
                            color: '#FFFFFF',
                            border: 'none',
                            fontWeight: 600,
                            gap: '6px',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(37, 211, 102, 0.2)'
                          }}
                        >
                          <MessageCircle size={15} />
                          <span>Order / Inquire via WhatsApp</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToast(`Use ${brand.name}'s website or public contact details to inquire.`, 'info')}
                          className="btn btn-outline-blue btn-block btn-sm"
                        >
                          Contact Brand
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Posts & Announcements */}
        {activeTab === 'posts' && (
          <div className="brand-profile-panel brand-profile-posts">
            {isOwner && <PostCreator onPostCreated={handlePostCreated} />}

            {posts.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No posts published yet"
                description={`${brand.name} has not published any public updates yet.`}
              />
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                />
              ))
            )}
          </div>
        )}

        {/* Tab 3: About & Credentials */}
        {activeTab === 'about' && (
          <div className="brand-profile-panel brand-profile-about-grid">
            {/* Left: Bio & Company Description */}
            <div className="card brand-profile-about-card">
              <h3 style={{ marginBottom: 'var(--space-4)' }}>About {brand.name}</h3>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--color-text-primary)', whiteSpace: 'pre-line' }}>
                {brand.fullDescription || brand.shortDescription}
              </p>

              <div style={{ marginTop: 'var(--space-8)', borderTop: '1px solid var(--color-divider)', paddingTop: 'var(--space-6)' }}>
                <h4>Commercial Profile Overview</h4>
                <div className="brand-profile-overview-grid">
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>Industry</span>
                    <strong>{brand.category}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>Headquarters</span>
                    <strong>{brand.city ? `${brand.city}, ${brand.country}` : brand.country}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>Official Website</span>
                    {brand.website ? (
                      <a href={brand.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-blue)', wordBreak: 'break-all' }}>
                        {brand.website}
                      </a>
                    ) : hasWhatsApp ? (
                      <a
                        href={createWhatsAppInquiry()}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#16A34A', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <MessageCircle size={13} />
                        <span>WhatsApp Storefront</span>
                      </a>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>Not specified</span>
                    )}
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>Editorial Status</span>
                    <span>{brand.verificationStatus === 'verified' ? 'Verified Commercial Entity' : 'Community Listed'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar: Trust & Contact Card */}
            <div className="card brand-profile-trust-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <ShieldCheck size={20} color="#16A34A" />
                <h4 style={{ margin: 0, fontSize: '1.05rem' }}>Commercial Trust Card</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
                {brand.cacNumber && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>CAC Legal Registration</span>
                    <strong style={{ color: '#0F172A' }}>{brand.cacNumber}</strong>
                  </div>
                )}

                {brand.address && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Physical Office</span>
                    <span style={{ color: '#1E293B' }}>{brand.address}</span>
                  </div>
                )}

                {brand.phone && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Direct Phone Hotline</span>
                    <a href={createPhoneUrl(brand.phone)} style={{ color: 'var(--color-blue)', fontWeight: 600 }}>{brand.phone}</a>
                  </div>
                )}

                {brand.contactEmail && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Business Inquiries</span>
                    <a href={`mailto:${brand.contactEmail}`} style={{ color: 'var(--color-blue)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Mail size={13} /> {brand.contactEmail}</a>
                  </div>
                )}

                {brand.deliveryInfo && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Delivery & Fulfillment</span>
                    <span style={{ color: '#166534', fontWeight: 600 }}>{brand.deliveryInfo}</span>
                  </div>
                )}
              </div>

              {hasWhatsApp && (
                <div style={{ marginTop: '20px' }}>
                  <a
                    href={createWhatsAppInquiry()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-block btn-sm"
                    style={{
                      backgroundColor: '#25D366',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 600,
                      gap: '6px',
                      justifyContent: 'center'
                    }}
                  >
                    <MessageCircle size={16} />
                    <span>Inquire on WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        brandName={brand.name}
        slug={brand.slug}
      />

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="brand"
        targetId={brand.id}
        targetTitle={`Brand: ${brand.name}`}
      />
    </div>
  );
};

export default BrandProfilePage;
