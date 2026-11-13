import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth';
import { Logo } from '../../components/common/Logo';
import { Mail, CheckCircle2, ArrowLeft, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.resetPassword(email);
      setSent(true);
      addToast('Password reset link has been dispatched', 'success');
    } catch (err) {
      addToast(err.message || 'Could not send reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-shell">
      <div className="auth-panel">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Link to="/" style={{ display: 'inline-block', marginBottom: 'var(--space-4)' }}>
            <Logo size={42} showWordmark={true} />
          </Link>
          <h2>Reset Your Password</h2>
          <p style={{ marginTop: '4px', fontSize: '0.9rem' }}>
            Enter your registered business email to receive secure recovery instructions.
          </p>
        </div>

        <div className="card auth-card">
          {sent ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
              <CheckCircle2 size={48} color="#16845B" style={{ margin: '0 auto 12px auto' }} />
              <h3>Recovery Email Sent</h3>
              <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                Instructions have been dispatched to <strong>{email}</strong>. Check your inbox and spam folders.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ marginTop: 'var(--space-6)', display: 'inline-block' }}>
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Business Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="email"
                    required
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-block">
                {loading ? 'Sending link...' : 'Send Recovery Instructions'}
              </button>
            </form>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  return (
    <div className="auth-page-shell">
      <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <div className="card auth-card">
          <Mail size={52} color="var(--color-blue)" style={{ margin: '0 auto 16px auto' }} />
          <h2>Confirm your email</h2>
          <p style={{ marginTop: '12px', fontSize: '0.95rem', lineHeight: 1.6 }}>
            We sent a secure confirmation link{email ? <> to <strong>{email}</strong></> : ''}. Open it to activate your account and finish publishing your brand profile.
          </p>
          <div style={{ marginTop: 'var(--space-8)', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link to="/login" className="btn btn-primary">Return to sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SetPasswordPage = () => {
  const { user, loading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Use at least 8 characters for your new password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const updatedUser = await authService.updatePassword(password);
      addToast('Your password has been set successfully.', 'success');
      navigate(updatedUser?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Could not set your password. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="auth-page-shell"><p>Securing your invitation...</p></div>;
  }

  return (
    <div className="auth-page-shell">
      <div className="auth-panel">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Logo size={42} showWordmark />
          <h1 className="auth-title" style={{ marginTop: '18px' }}>Set your password</h1>
          <p>Create a secure password for future BRANDSCOPE sign-ins.</p>
        </div>
        <div className="card auth-card">
          {!user ? (
            <div style={{ textAlign: 'center' }}>
              <AlertCircle size={38} color="var(--color-warning)" style={{ margin: '0 auto 12px' }} />
              <h3>Invitation link unavailable</h3>
              <p style={{ margin: '8px 0 20px' }}>Open the newest invitation email again, or request a password reset.</p>
              <Link to="/forgot-password" className="btn btn-primary">Request a new link</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="auth-error"><AlertCircle size={16} /><span>{error}</span></div>}
              <div className="form-group">
                <label className="form-label">New password</label>
                <div className="auth-input-wrap">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm new password</label>
                <div className="auth-input-wrap">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" className="auth-password-toggle" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}>
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <button className="btn btn-primary btn-block" disabled={submitting} type="submit">
                {submitting ? 'Saving password...' : 'Save password and continue'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const AuthConfirmPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  }, [loading, navigate, user]);

  return (
    <div className="auth-page-shell">
      <div className="card auth-card" style={{ maxWidth: '460px', textAlign: 'center' }}>
        <CheckCircle2 size={46} color="var(--color-success)" style={{ margin: '0 auto 14px' }} />
        <h2>Confirming your account</h2>
        <p style={{ marginTop: '8px' }}>{loading || user ? 'Preparing your secure workspace...' : 'This confirmation link may have expired. Please sign in or request another email.'}</p>
        {!loading && !user && <Link to="/login" className="btn btn-primary" style={{ marginTop: '20px' }}>Go to sign in</Link>}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
