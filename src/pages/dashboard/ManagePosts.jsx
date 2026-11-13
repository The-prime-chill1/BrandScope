import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../services/dataStore';
import { PostCard } from '../../components/posts/PostCard';
import { PostCreator } from '../../components/posts/PostCreator';
import { EmptyState } from '../../components/common/EmptyState';
import { FileText, PlusCircle } from 'lucide-react';
import { useDataStoreVersion } from '../../hooks/useDataStoreVersion';

export const ManagePosts = () => {
  const storeVersion = useDataStoreVersion();
  const { user, currentBrand } = useAuth();
  const [posts, setPosts] = useState(
    currentBrand ? dataStore.getPosts({ brandId: currentBrand.id }) : []
  );

  useEffect(() => {
    setPosts(currentBrand ? dataStore.getPosts({ brandId: currentBrand.id }) : []);
  }, [currentBrand, storeVersion]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  if (!currentBrand) {
    return <div className="card" style={{ padding: '24px' }}>No brand found.</div>;
  }

  return (
    <div style={{ maxWidth: '820px' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Posts & Announcements</h1>
        <p style={{ marginTop: '4px', fontSize: '0.9rem' }}>
          Publish updates, media releases, product launches, and industry insights to your audience.
        </p>
      </div>

      {/* Post Publisher */}
      <PostCreator onPostCreated={handlePostCreated} />

      {/* Existing Posts List */}
      <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-4)' }}>
        Published Posts ({posts.length})
      </h3>

      {posts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No posts published yet"
          description="Use the creator above to publish your first business update."
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
  );
};

export default ManagePosts;
