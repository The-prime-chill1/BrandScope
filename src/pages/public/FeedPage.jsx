import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, PenSquare, Rss } from 'lucide-react';
import { PostCard } from '../../components/posts/PostCard';
import { PostCreator } from '../../components/posts/PostCreator';
import { Seo } from '../../components/common/Seo';
import { dataStore } from '../../services/dataStore';
import { useAuth } from '../../contexts/AuthContext';
import { useDataStoreVersion } from '../../hooks/useDataStoreVersion';

export const FeedPage = () => {
  const storeVersion = useDataStoreVersion();
  const { user, currentBrand } = useAuth();
  const [posts, setPosts] = useState(dataStore.getPosts({ limit: 40 }));

  useEffect(() => {
    setPosts(dataStore.getPosts({ limit: 40 }));
  }, [storeVersion]);

  const handlePostCreated = (newPost) => setPosts((current) => [newPost, ...current]);
  const handlePostDeleted = (postId) => setPosts((current) => current.filter((post) => post.id !== postId));

  return (
    <main className="public-page feed-page">
      <Seo
        title="Brand Feed"
        description="Read real announcements, launches, milestones, and updates published directly by businesses on BRANDSCOPE."
        canonicalPath="/feed"
      />

      <header className="feed-page-header">
        <div className="container feed-page-header-inner">
          <span className="section-eyebrow"><Rss size={14} /> Member-published feed</span>
          <h1>Updates directly from brands.</h1>
          <p>Nothing here is filler or advertising. This feed only contains posts published by BRANDSCOPE business accounts.</p>
        </div>
      </header>

      <section className="feed-main-section">
        <div className="container feed-stream-shell">
          {user && currentBrand && <PostCreator onPostCreated={handlePostCreated} />}

          {!dataStore.initialized ? (
            <div className="workspace-loading"><span className="workspace-loading-mark" />Loading member updates...</div>
          ) : posts.length === 0 ? (
            <div className="feed-zero-state">
              <span className="feed-zero-icon"><PenSquare size={28} /></span>
              <span className="section-eyebrow">The first post is still waiting</span>
              <h2>No brand updates yet.</h2>
              <p>
                When businesses publish product launches, company news, milestones, or stories, their posts will appear here in chronological order.
              </p>
              {!currentBrand ? (
                <div className="feed-zero-actions">
                  <Link to="/signup" className="btn btn-primary">List your brand <ArrowRight size={16} /></Link>
                  <Link to="/about" className="btn btn-outline">How BRANDSCOPE works</Link>
                </div>
              ) : (
                <div className="feed-zero-owner-note">
                  <Building2 size={17} /> Use the publisher above to share the first update from {currentBrand.name}.
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="feed-stream-heading">
                <div><span className="feed-stream-dot" /><strong>Latest brand updates</strong></div>
                <span>{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>
              </div>
              <div className="feed-post-list">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onPostDeleted={handlePostDeleted} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default FeedPage;
