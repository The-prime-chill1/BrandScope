import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Copy, Check, Share2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const ShareModal = ({ isOpen, onClose, brandName, slug, customUrl }) => {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();
  const shareUrl = customUrl || `${window.location.origin}/brand/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      addToast('Profile link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      addToast('Could not copy link to clipboard', 'error');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${brandName} on BRANDSCOPE`,
          text: `Check out ${brandName}'s official verified profile on BRANDSCOPE — Where Brands Get Discovered:`,
          url: shareUrl
        });
        onClose();
      } catch (err) {
        // Share cancelled or not supported
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share ${brandName}`}>
      <p style={{ marginBottom: 'var(--space-4)' }}>
        Share this brand profile with partners, clients, and audiences worldwide.
      </p>

      {/* Copy link input box */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-5)' }}>
        <input
          type="text"
          readOnly
          value={shareUrl}
          className="form-input"
          style={{ backgroundColor: 'var(--color-bg)', cursor: 'text' }}
          onClick={(e) => e.target.select()}
        />
        <button
          type="button"
          onClick={handleCopy}
          className="btn btn-primary"
          style={{ gap: '6px' }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {navigator.share && (
        <button
          type="button"
          onClick={handleNativeShare}
          className="btn btn-outline btn-block"
          style={{ gap: '8px' }}
        >
          <Share2 size={16} />
          <span>Share via System Dialog</span>
        </button>
      )}
    </Modal>
  );
};

export default ShareModal;
