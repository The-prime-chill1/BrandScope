import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { VerificationBadge } from '../common/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../services/dataStore';
import { MapPin, Users, UserPlus, Check, MessageCircle, ShoppingBag } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const BrandCard = ({ brand }) => {
  const { user, currentBrand } = useAuth();
  const { addToast } = useToast();
  const [following, setFollowing] = useState(
    user ? dataStore.isFollowing(brand.id, user.uid) : false
  );
  const [followerCount, setFollowerCount] = useState(brand.followerCount || 0);

  const cleanPhone = (brand.whatsapp || brand.phone || '').replace(/[^0-9]/g, '');
  const products = brand.products || [];

  const handleFollowToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      addToast('Please sign in with a brand account to follow businesses.', 'info');
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
        currentBrand ? currentBrand.name : 'A Business'
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

  return (
    <article className="brand-card">
      {/* Cover */}
      <div
        className="brand-card-cover"
        style={brand.coverUrl ? { backgroundImage: `url(${brand.coverUrl})` } : undefined}
      >
      </div>

      <div className="brand-card-body">
        {/* Avatar */}
        <Link to={`/brand/${brand.slug}`}>
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.name} className="brand-card-avatar" loading="lazy" />
          ) : (
            <span className="brand-card-avatar brand-card-avatar--fallback" aria-label={`${brand.name} logo placeholder`}>
              {brand.name?.charAt(0)?.toUpperCase() || 'B'}
            </span>
          )}
        </Link>

        {/* Brand Name & Badges */}
        <div className="brand-card-title">
          <Link to={`/brand/${brand.slug}`}>
            <h3 style={{ margin: 0 }}>{brand.name}</h3>
          </Link>
          {brand.verificationStatus === 'verified' && <VerificationBadge size={15} />}
        </div>

        {/* Category & Location */}
        <div className="brand-card-category" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span>{brand.category}</span>
          {brand.city && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--color-text-muted)' }}>
              <MapPin size={12} />
              {brand.city}, {brand.country}
            </span>
          )}
          {products.length > 0 && (
            <span
              style={{
                fontSize: '0.7rem',
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                padding: '1px 6px',
                borderRadius: '4px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <ShoppingBag size={11} />
              {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="brand-card-desc">{brand.shortDescription}</p>

        {/* Card Footer: Follower count, WhatsApp shortcut & Follow action */}
        <div className="brand-card-footer">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            <Users size={14} />
            {followerCount.toLocaleString()} followers
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${brand.name}, I discovered your business listing on BRANDSCOPE (https://brandscope.network/brand/${brand.slug}) and would like to inquire about your offerings.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`Chat with ${brand.name} on WhatsApp`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  border: '1px solid #86EFAC',
                  textDecoration: 'none'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <MessageCircle size={14} />
              </a>
            )}

            {user && user.uid === brand.ownerUid ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Your Brand
              </span>
            ) : (
              <button
                type="button"
                onClick={handleFollowToggle}
                className={`btn btn-sm ${following ? 'btn-outline' : 'btn-outline-blue'}`}
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
              >
                {following ? (
                  <>
                    <Check size={13} />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={13} />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default BrandCard;
