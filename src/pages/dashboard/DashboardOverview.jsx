import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../services/dataStore';
import { useDataStoreVersion } from '../../hooks/useDataStoreVersion';
import { VerificationBadge } from '../../components/common/Badge';
import { 
  Users, 
  FileText, 
  Eye, 
  TrendingUp, 
  Edit3, 
  PlusCircle, 
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const DashboardOverview = () => {
  useDataStoreVersion();
  const { user, currentBrand } = useAuth();

  if (!currentBrand) {
    return (
      <div className="card" style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
        <h3>No Brand Profile Linked</h3>
        <p style={{ marginTop: '8px', marginBottom: 'var(--space-6)' }}>
          You have an active business account, but no public brand profile has been published yet.
        </p>
        <Link to="/signup" className="btn btn-primary">
          Complete Brand Setup
        </Link>
      </div>
    );
  }

  const posts = dataStore.getPosts({ brandId: currentBrand.id });
  const totalLikes = posts.reduce((sum, p) => sum + (p.likeCount || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.commentCount || 0), 0);

  // Profile completion calculation
  let completionScore = 20;
  if (currentBrand.name) completionScore += 20;
  if (currentBrand.shortDescription) completionScore += 20;
  if (currentBrand.website) completionScore += 15;
  if (currentBrand.logoUrl) completionScore += 15;
  if (currentBrand.coverUrl) completionScore += 10;

  return (
    <div>
      {/* Top Welcome Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: 'var(--space-8)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.8rem', margin: 0 }}>{currentBrand.name}</h1>
            {currentBrand.verificationStatus === 'verified' && <VerificationBadge size={16} />}
          </div>
          <p style={{ marginTop: '4px', fontSize: '0.9rem' }}>
            Welcome to your commercial workspace. Here is your brand’s performance snapshot.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to={`/brand/${currentBrand.slug}`} className="btn btn-outline btn-sm" style={{ gap: '6px' }}>
            <span>Public Profile</span>
            <ExternalLink size={13} />
          </Link>
          <Link to="/dashboard/posts" className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
            <PlusCircle size={15} />
            <span>Create Post</span>
          </Link>
        </div>
      </div>

      {/* Profile Completion Meter */}
      {completionScore < 100 && (
        <div
          className="card"
          style={{
            padding: 'var(--space-5)',
            marginBottom: 'var(--space-8)',
            backgroundColor: 'var(--color-blue-subtle)',
            border: '1px solid var(--color-blue-border)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-navy)' }}>
              Profile Completion: {completionScore}%
            </span>
            <Link to="/dashboard/profile" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-blue)' }}>
              Complete Profile &rarr;
            </Link>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#FFFFFF', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${completionScore}%`,
                height: '100%',
                backgroundColor: 'var(--color-blue)',
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Followers</span>
            <Users size={18} color="var(--color-blue)" />
          </div>
          <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{(currentBrand.followerCount || 0).toLocaleString()}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>Active commercial network</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Published Posts</span>
            <FileText size={18} color="#D97706" />
          </div>
          <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{posts.length}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Public announcements</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Total Likes</span>
            <TrendingUp size={18} color="#E11D48" />
          </div>
          <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{totalLikes}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Community interactions</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Total Comments</span>
            <CheckCircle2 size={18} color="var(--color-success)" />
          </div>
          <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{totalComments}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Business discussions</span>
        </div>
      </div>

      {/* Recent Posts Section */}
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
          <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Recent Published Updates</h3>
          <Link to="/dashboard/posts" className="btn btn-outline btn-sm">
            Manage All Posts
          </Link>
        </div>

        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--color-text-muted)' }}>
            <FileText size={36} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
            <p>You haven’t published any updates yet.</p>
            <Link to="/dashboard/posts" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
              Publish Your First Update
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {posts.slice(0, 3).map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: 'var(--color-bg)',
                  borderRadius: 'var(--radius-md)',
                  gap: '12px'
                }}
              >
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--color-navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.text}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {new Date(p.createdAt).toLocaleDateString()} &bull; {p.likeCount} likes &bull; {p.commentCount} comments
                  </div>
                </div>

                <Link to={`/post/${p.id}`} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-blue)', fontSize: '0.8rem' }}>
                  View Post
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
