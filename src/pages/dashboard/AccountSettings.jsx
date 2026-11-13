import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth';
import { dataStore } from '../../services/dataStore';
import { useToast } from '../../contexts/ToastContext';
import { ShieldCheck, Mail, Lock, User, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const AccountSettings = () => {
  const { user, currentBrand, logout } = useAuth();
  const { addToast } = useToast();

  const [reqSent, setReqSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!user) return null;

  const handleRequestVerification = () => {
    setReqSent(true);
    addToast('Brand verification request submitted for editorial review.', 'success');
  };

  const handleResetPassword = async () => {
    try {
      await authService.resetPassword(user.email);
      setResetSent(true);
      addToast(`Password reset link sent to ${user.email}`, 'info');
    } catch (err) {
      addToast(err.message || 'Failed to send reset link', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Account & Security Settings</h1>
        <p style={{ marginTop: '4px', fontSize: '0.9rem' }}>
          Manage your credentials, security preferences, and commercial verification status.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: 'var(--space-4)' }}>Business Account Identity</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>Primary Contact</span>
            <strong>{user.name}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>Business Email</span>
            <strong>{user.email}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>Account Role</span>
            <span className="badge badge-neutral">{user.role}</span>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>Email Verification</span>
            <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.85rem' }}>Verified Commercial Account</span>
          </div>
        </div>
      </div>

      {/* Verification Request Card */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Official Brand Verification</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '4px', maxWidth: '520px' }}>
              The verified checkmark confirms your commercial identity and prevents impersonation. Requires documented corporate registration or tax records.
            </p>
          </div>

          {currentBrand?.verificationStatus === 'verified' ? (
            <span className="badge badge-verified">Brand Verified</span>
          ) : reqSent ? (
            <span className="badge badge-warning">Review Pending</span>
          ) : (
            <button
              type="button"
              onClick={handleRequestVerification}
              className="btn btn-outline-blue btn-sm"
              style={{ gap: '6px' }}
            >
              <ShieldCheck size={16} />
              <span>Request Verification</span>
            </button>
          )}
        </div>
      </div>

      {/* Security & Password */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: 'var(--space-3)' }}>Security & Authentication</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
          To update your password or enhance login security, dispatch a secure reset token to your verified business email.
        </p>

        <button
          type="button"
          onClick={handleResetPassword}
          className="btn btn-outline btn-sm"
          style={{ gap: '6px' }}
        >
          <Lock size={15} />
          <span>{resetSent ? 'Reset Token Sent — Check Email' : 'Send Password Reset Email'}</span>
        </button>
      </div>

      {/* Danger Zone */}
      <div
        className="card"
        style={{
          padding: 'var(--space-6)',
          borderColor: 'var(--color-error-border)',
          backgroundColor: 'var(--color-error-bg)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-error)', marginBottom: '6px' }}>
          <AlertTriangle size={18} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-error)' }}>Account Termination</h3>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#7F1D1D', marginBottom: 'var(--space-4)' }}>
          Deleting your account will unpublish your brand profile, remove all published posts, and terminate active follower connections.
        </p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Are you sure you want to request account deletion? This action cannot be reversed.')) {
              addToast('Account deletion request queued with retention compliance.', 'info');
              logout();
            }
          }}
          className="btn btn-danger btn-sm"
        >
          Request Account Deletion
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;
