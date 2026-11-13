import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../services/dataStore';
import { useToast } from '../../contexts/ToastContext';
import { Trash2, Send, CornerDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CommentSection = ({ postId, onCommentAdded }) => {
  const { user, currentBrand } = useAuth();
  const { addToast } = useToast();
  const [comments, setComments] = useState(dataStore.getComments(postId));
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please sign in with a brand account to comment.', 'info');
      return;
    }
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const newComment = await dataStore.addComment({ postId, content }, user, currentBrand);
      setComments((prev) => [...prev, newComment]);
      setContent('');
      addToast('Comment posted', 'success');
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await dataStore.deleteComment(commentId, user.uid);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      addToast('Comment deleted', 'info');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-divider)' }}>
      {/* Existing Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        {comments.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            No comments yet. Start the conversation!
          </p>
        ) : (
          comments.map((comm) => {
            const isAuthor = user?.uid === comm.authorUid;
            return (
              <div
                key={comm.id}
                style={{
                  display: 'flex',
                  gap: '10px',
                  backgroundColor: 'var(--color-bg)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                {comm.authorLogo ? (
                  <img
                    src={comm.authorLogo}
                    alt={comm.authorName}
                    style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-navy)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}
                  >
                    {comm.authorName.charAt(0)}
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {comm.authorBrandSlug ? (
                        <Link
                          to={`/brand/${comm.authorBrandSlug}`}
                          style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-navy)' }}
                        >
                          {comm.authorName}
                        </Link>
                      ) : (
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-navy)' }}>
                          {comm.authorName}
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {new Date(comm.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {isAuthor && (
                      <button
                        type="button"
                        onClick={() => handleDelete(comm.id)}
                        title="Delete comment"
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                    {comm.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Comment Input */}
      {user ? (
        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            className="form-input"
            style={{ padding: '8px 12px', fontSize: '0.875rem' }}
            placeholder={`Comment as ${currentBrand ? currentBrand.name : user.name}...`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="submit" disabled={submitting || !content.trim()} className="btn btn-primary btn-sm" style={{ padding: '8px 14px' }}>
            <Send size={14} />
          </button>
        </form>
      ) : (
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CornerDownRight size={14} />
          <span>
            <Link to="/login" style={{ fontWeight: 600, textDecoration: 'underline' }}>Sign in with a brand</Link> to join the discussion.
          </span>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
