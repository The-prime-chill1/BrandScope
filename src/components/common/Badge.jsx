import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const VerificationBadge = ({ size = 16, className = '' }) => (
  <span
    className={`badge badge-verified ${className}`}
    title="Verified Brand Profile"
    style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', verticalAlign: 'middle' }}
  >
    <CheckCircle2 size={size} color="#0284C7" />
    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Verified</span>
  </span>
);

export const StatusBadge = ({ status }) => {
  const norm = (status || '').toLowerCase();
  if (norm === 'active' || norm === 'approved' || norm === 'resolved') {
    return <span className="badge badge-success">{status}</span>;
  }
  if (norm === 'pending' || norm === 'review_required' || norm === 'unverified') {
    return <span className="badge badge-warning">{status}</span>;
  }
  if (norm === 'suspended' || norm === 'failed' || norm === 'rejected' || norm === 'hidden') {
    return <span className="badge badge-error">{status}</span>;
  }
  return <span className="badge badge-neutral">{status}</span>;
};
