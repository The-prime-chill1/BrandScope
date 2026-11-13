import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../services/dataStore';
import { useToast } from '../../contexts/ToastContext';
import { Image, Link as LinkIcon, Send, X, Smartphone } from 'lucide-react';
import { ImageUploader } from '../common/ImageUploader';

export const PostCreator = ({ onPostCreated }) => {
  const { user, currentBrand } = useAuth();
  const { addToast } = useToast();
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!user || !currentBrand) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      addToast('Please write something in your post', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const newPost = await dataStore.createPost(
        {
          brandId: currentBrand.id,
          text: text.trim(),
          imageUrl: imageUrl.trim(),
          link: link.trim()
        },
        user
      );
      addToast('Post published with its own discoverable BRANDSCOPE permalink.', 'success');
      setText('');
      setImageUrl('');
      setLink('');
      setShowImageInput(false);
      setShowLinkInput(false);
      if (onPostCreated) onPostCreated(newPost);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: 'var(--space-6)',
        marginBottom: 'var(--space-6)',
        border: '1px solid var(--color-blue-border)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <img
          src={currentBrand.logoUrl}
          alt={currentBrand.name}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            objectFit: 'cover'
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
            Publishing as <strong style={{ color: 'var(--color-navy)' }}>{currentBrand.name}</strong>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Share a company milestone, product announcement, or industry insight..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ resize: 'vertical' }}
            />

            {/* Device / Web Image Uploader */}
            {showImageInput && (
              <div style={{ marginTop: 'var(--space-3)' }}>
                <ImageUploader
                  label="Choose a photo from your device"
                  hint="Select from your phone gallery, camera, or computer. BRANDSCOPE optimizes and uploads it securely."
                  value={imageUrl}
                  onChange={setImageUrl}
                  allowUrl={false}
                />
              </div>
            )}

            {/* Optional Link Input */}
            {showLinkInput && (
              <div style={{ marginTop: 'var(--space-3)', position: 'relative' }}>
                <input
                  type="url"
                  className="form-input"
                  placeholder="External Link (e.g. https://yourbusiness.com/deal)"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => { setShowLinkInput(false); setLink(''); }}
                  style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'var(--space-4)',
                borderTop: '1px solid var(--color-divider)',
                paddingTop: 'var(--space-3)'
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowImageInput(!showImageInput)}
                  className={`btn btn-sm ${showImageInput ? 'btn-secondary' : 'btn-outline'}`}
                  style={{ gap: '4px' }}
                >
                  <Image size={15} />
                  <span>Media</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkInput(!showLinkInput)}
                  className={`btn btn-sm ${showLinkInput ? 'btn-secondary' : 'btn-outline'}`}
                  style={{ gap: '4px' }}
                >
                  <LinkIcon size={15} />
                  <span>Link</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="btn btn-primary btn-sm"
                style={{ gap: '6px' }}
              >
                <Send size={15} />
                <span>{submitting ? 'Publishing...' : 'Publish Update'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostCreator;
