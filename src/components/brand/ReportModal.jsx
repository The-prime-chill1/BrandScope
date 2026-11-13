import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../services/dataStore';
import { useToast } from '../../contexts/ToastContext';
import { AlertTriangle, Send } from 'lucide-react';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam, misleading claims, or deceptive links' },
  { value: 'impersonation', label: 'Impersonating another registered brand or company' },
  { value: 'inappropriate', label: 'Inappropriate or harmful business content' },
  { value: 'harassment', label: 'Harassment, defamation, or hate speech' },
  { value: 'copyright', label: 'Intellectual property or copyright infringement' },
  { value: 'other', label: 'Other violation of Community Guidelines' }
];

export const ReportModal = ({ isOpen, onClose, targetType = 'brand', targetId, targetTitle = 'Content' }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please sign in to submit a trust and safety report.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await dataStore.createReport(
        {
          targetType,
          targetId,
          reason,
          details
        },
        user
      );
      addToast('Thank you. Your report has been submitted to BRANDSCOPE trust & moderation.', 'success');
      setDetails('');
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to submit report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Report ${targetTitle}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-warning)', marginBottom: 'var(--space-4)', fontSize: '0.875rem' }}>
        <AlertTriangle size={18} />
        <span>Our trust & safety team reviews every verified report within 24 hours.</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Reason for reporting</label>
          <select
            className="form-select"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {REPORT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Additional context (Optional)</label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Please describe the violation or supply supporting links..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: 'var(--space-6)' }}>
          <button type="button" onClick={onClose} className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn btn-danger" style={{ gap: '6px' }}>
            <Send size={15} />
            <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportModal;
