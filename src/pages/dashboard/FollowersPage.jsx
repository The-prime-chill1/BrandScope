import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../services/dataStore';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { Users, Building, ExternalLink } from 'lucide-react';

export const FollowersPage = () => {
  const { currentBrand } = useAuth();
  const [activeTab, setActiveTab] = useState('followers'); // 'followers' | 'following'

  if (!currentBrand) return null;

  // Retrieve followers
  const followerUids = dataStore.followers[currentBrand.id] || [];
  const followers = followerUids
    .map((uid) => dataStore.brands.find((b) => b.ownerUid === uid))
    .filter(Boolean);

  // Retrieve following
  const following = dataStore.brands.filter((b) =>
    dataStore.isFollowing(b.id, currentBrand.ownerUid)
  );

  return (
    <div style={{ maxWidth: '820px' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Followers & Connections</h1>
        <p style={{ marginTop: '4px', fontSize: '0.9rem' }}>
          Explore the business network following your brand updates and the brands you follow.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-6)' }}>
        <button
          type="button"
          onClick={() => setActiveTab('followers')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'followers' ? '2px solid var(--color-blue)' : '2px solid transparent',
            color: activeTab === 'followers' ? 'var(--color-blue)' : 'var(--color-text-secondary)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Followers ({followers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('following')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'following' ? '2px solid var(--color-blue)' : '2px solid transparent',
            color: activeTab === 'following' ? 'var(--color-blue)' : 'var(--color-text-secondary)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Following ({following.length})
        </button>
      </div>

      {/* List */}
      {activeTab === 'followers' ? (
        followers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No followers yet"
            description="Publish useful announcements and share your public profile to grow genuine business connections."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {followers.map((b) => (
              <div
                key={b.id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={b.logoUrl}
                    alt={b.name}
                    style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-navy)' }}>{b.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{b.category} &bull; {b.country}</span>
                  </div>
                </div>

                <Link to={`/brand/${b.slug}`} className="btn btn-outline btn-sm" style={{ gap: '4px' }}>
                  <span>View Brand</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            ))}
          </div>
        )
      ) : following.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Not following any brands yet"
          description="Browse the discovery directory to connect with other businesses in your industry."
          actionLabel="Discover Brands"
          actionLink="/discover"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {following.map((b) => (
            <div
              key={b.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={b.logoUrl}
                  alt={b.name}
                  style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-navy)' }}>{b.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{b.category} &bull; {b.country}</span>
                </div>
              </div>

              <Link to={`/brand/${b.slug}`} className="btn btn-outline btn-sm" style={{ gap: '4px' }}>
                <span>View Brand</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowersPage;
