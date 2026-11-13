import React, { useState } from 'react';
import { PostCard } from '../../components/posts/PostCard';
import { PostCreator } from '../../components/posts/PostCreator';
import { dataStore } from '../../services/dataStore';
import { useAuth } from '../../contexts/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';
import { Rss } from 'lucide-react';

export const FeedPage = () => {
  const { user, currentBrand } = useAuth();
  const [posts, setPosts] = useState(dataStore.getPosts({ limit: 40 }));

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div style={{ paddingBottom: 'var(--space-16)' }}>
      {/* Header */}
      <section
        style={{
          backgroundColor: 'var(--color-navy)',
          color: '#FFFFFF',
          padding: 'var(--space-10) 0',
          marginBottom: 'var(--space-8)'
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '640px' }}>
            <h1 style={{ color: '#FFFFFF', fontSize: '2.4rem', marginBottom: '8px' }}>
              Public Brand Feed
            </h1>
            <p style={{ color: '#CBD5E1', fontSize: '1.05rem' }}>
              Real-time updates, engineering breakthroughs, collections, and milestones from businesses across the network.
            </p>
          </div>
        </div>
      </section>

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', maxWidth: '740px', margin: '0 auto' }}>
          {/* Post Creator if signed in as a brand */}
          {user && currentBrand ? (
            <PostCreator onPostCreated={handlePostCreated} />
          ) : (
            <div
              className="card"
              style={{
                padding: 'var(--space-6)',
                marginBottom: 'var(--space-6)',
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <h4 style={{ margin: 0, color: 'var(--color-navy)' }}>Are you a brand owner?</h4>
                <p style={{ fontSize: '0.875rem', margin: '2px 0 0 0' }}>
                  Register your business to publish official company updates and reach corporate buyers.
                </p>
              </div>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Create Brand Profile
              </Link>
            </div>
          )}

          {/* Posts Feed */}
          {posts.length === 0 ? (
            <EmptyState
              icon={Rss}
              title="No updates in feed"
              description="There are no posts to display in this view yet."
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
      </div>
    </div>
  );
};

export default FeedPage;
