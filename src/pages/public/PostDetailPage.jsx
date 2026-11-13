import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dataStore } from '../../services/dataStore';
import { PostCard } from '../../components/posts/PostCard';
import { Seo } from '../../components/common/Seo';
import { ArrowLeft, Globe2, SearchCheck } from 'lucide-react';

export const PostDetailPage = () => {
  const { postId } = useParams();
  const post = dataStore.getPostById(postId);
  const origin = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '');

  const seo = useMemo(() => {
    if (!post) return null;
    const excerpt = post.text.replace(/\s+/g, ' ').trim().slice(0, 155);
    const canonicalUrl = `${origin}/post/${post.id}`;
    return {
      title: `${post.brandName} on BRANDSCOPE`,
      description: excerpt,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'SocialMediaPosting',
        headline: `${post.brandName}: ${excerpt.slice(0, 90)}`,
        articleBody: post.text,
        datePublished: post.createdAt,
        dateModified: post.updatedAt || post.createdAt,
        url: canonicalUrl,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
        image: post.imageUrl || undefined,
        author: {
          '@type': 'Organization',
          name: post.brandName,
          url: `${origin}/brand/${post.brandSlug}`
        },
        publisher: {
          '@type': 'Organization',
          name: 'BRANDSCOPE',
          slogan: 'Where Brands Get Discovered.',
          url: origin,
          logo: { '@type': 'ImageObject', url: `${origin}/favicon.svg` }
        },
        isPartOf: { '@type': 'WebSite', name: 'BRANDSCOPE', url: origin },
        copyrightHolder: { '@type': 'Organization', name: post.brandName }
      }
    };
  }, [origin, post]);

  if (!post) {
    return (
      <div className="container" style={{ padding: 'var(--space-20) 0', textAlign: 'center' }}>
        <h2>Post not found</h2>
        <p style={{ marginTop: '8px', marginBottom: '24px' }}>This update does not exist or may have been removed.</p>
        <Link to="/feed" className="btn btn-primary">Back to the feed</Link>
      </div>
    );
  }

  return (
    <div className="post-detail-page">
      <Seo
        title={seo.title}
        description={seo.description}
        canonicalPath={`/post/${post.id}`}
        image={post.imageUrl}
        schema={seo.schema}
        type="article"
      />
      <div className="container post-detail-container">
        <div className="post-detail-nav">
          <Link to={`/brand/${post.brandSlug}`}><ArrowLeft size={16} /> Visit {post.brandName}</Link>
          <Link to="/feed">Browse the public feed</Link>
        </div>

        <div className="source-attribution">
          <div className="source-attribution-icon"><Globe2 size={19} /></div>
          <div>
            <strong>Originally published on BRANDSCOPE</strong>
            <span>Where Brands Get Discovered · Official update from {post.brandName}</span>
          </div>
          <div className="search-ready-badge"><SearchCheck size={14} /> Search discoverable</div>
        </div>

        <PostCard post={post} />

        <section className="post-source-footer">
          <h3>Publish from your official brand identity</h3>
          <p>Every BRANDSCOPE update receives a permanent public URL, canonical metadata, structured publisher attribution, and inclusion in the platform sitemap. Search-engine appearance and timing remain controlled by the search engine.</p>
          <Link to="/signup" className="btn btn-primary btn-sm">Create your brand profile</Link>
        </section>
      </div>
    </div>
  );
};

export default PostDetailPage;
