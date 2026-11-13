import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { VerificationBadge } from '../common/Badge';
import { CommentSection } from './CommentSection';
import { ShareModal } from '../brand/ShareModal';
import { ReportModal } from '../brand/ReportModal';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../services/dataStore';
import { useToast } from '../../contexts/ToastContext';
import { Heart, MessageSquare, Share2, Flag, Trash2, ExternalLink } from 'lucide-react';

export const PostCard = ({ post, onPostDeleted }) => {
  const { user, currentBrand, isAdmin } = useAuth();
  const { addToast } = useToast();
  const [liked, setLiked] = useState(user ? dataStore.isLiked(post.id, user.uid) : false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const isOwner = user && currentBrand && currentBrand.id === post.brandId;
  const canDelete = isOwner || isAdmin;

  const handleLike = async () => {
    if (!user) {
      addToast('Please sign in with a brand to like posts.', 'info');
      return;
    }

    try {
      const res = await dataStore.toggleLike(
        post.id,
        user.uid,
        currentBrand ? currentBrand.name : 'A Brand'
      );
      setLiked(res.isLiked);
      setLikeCount(res.likeCount);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await dataStore.deletePost(post.id, user.uid);
        addToast('Post removed', 'info');
        if (onPostDeleted) onPostDeleted(post.id);
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  return (
    <article className="post-card">
      {/* Post Header */}
      <div className="post-header">
        <div className="post-author">
          <Link to={`/brand/${post.brandSlug}`}>
            <img
              src={post.brandLogo}
              alt={post.brandName}
              className="post-author-img"
              loading="lazy"
            />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Link
                to={`/brand/${post.brandSlug}`}
                style={{ fontWeight: 700, color: 'var(--color-navy)', fontSize: '1rem' }}
              >
                {post.brandName}
              </Link>
              {post.isVerified && <VerificationBadge size={14} />}
            </div>
            <div style={{ marginTop: '2px' }}>
              <Link
                to={`/post/${post.id}`}
                style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textDecoration: 'none' }}
                title="View permanent post on BRANDSCOPE & Google Index"
              >
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })} &bull; BRANDSCOPE
              </Link>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-ghost btn-sm"
              title="Delete post"
              style={{ padding: '6px', color: 'var(--color-error)' }}
            >
              <Trash2 size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="btn btn-ghost btn-sm"
            title="Report post"
            style={{ padding: '6px' }}
          >
            <Flag size={16} />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="post-content-text">{post.text}</div>

      {/* Post Image Media */}
      {post.imageUrl && (
        <div className="post-media">
          <img src={post.imageUrl} alt="Brand update" loading="lazy" />
        </div>
      )}

      {/* External Link */}
      {post.link && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
            style={{ gap: '6px', display: 'inline-flex', fontSize: '0.85rem' }}
          >
            <span>Learn More / View Link</span>
            <ExternalLink size={14} />
          </a>
        </div>
      )}

      {/* Actions Bar */}
      <div className="post-actions">
        <button
          type="button"
          onClick={handleLike}
          className={`post-action-btn ${liked ? 'active-like' : ''}`}
        >
          <Heart size={18} fill={liked ? '#E11D48' : 'none'} color={liked ? '#E11D48' : 'currentColor'} />
          <span>{likeCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className={`post-action-btn ${showComments ? 'active' : ''}`}
        >
          <MessageSquare size={18} />
          <span>{commentCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="post-action-btn"
        >
          <Share2 size={18} />
          <span>Share</span>
        </button>
      </div>

      {/* Collapsible Comment Drawer */}
      {showComments && (
        <CommentSection
          postId={post.id}
          onCommentAdded={() => setCommentCount((c) => c + 1)}
        />
      )}

      {/* Modals */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        brandName={post.brandName}
        customUrl={`${window.location.origin}/post/${post.id}`}
      />

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="post"
        targetId={post.id}
        targetTitle={`Post by ${post.brandName}`}
      />
    </article>
  );
};

export default PostCard;
