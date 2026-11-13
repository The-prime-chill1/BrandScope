import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/common/Logo';
import { Mail, Lock, AlertCircle, Eye, EyeOff, ShieldCheck, Building2, Search, BarChart3, ArrowRight } from 'lucide-react';
import { isAdministratorEmail } from '../../config/admins';
import { preloadAdminWorkspace, preloadBrandWorkspace } from '../../app/preloadWorkspace';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const adminMode = searchParams.get('mode') === 'admin';
  const from = location.state?.from?.pathname || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      void (isAdministratorEmail(email) ? preloadAdminWorkspace() : preloadBrandWorkspace());
      const user = await login(email, password, remember);
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-page-shell auth-login-shell ${adminMode ? 'is-admin-login' : ''}`}>
      <div className="auth-experience">
        <section className="auth-story">
          <Link to="/" className="auth-story-logo"><Logo size={39} showWordmark light /></Link>
          <div className="auth-story-content">
            <span className="auth-story-kicker"><ShieldCheck size={14} /> {adminMode ? 'Protected platform access' : 'Business discovery network'}</span>
            <h2>{adminMode ? 'Operate the platform with clarity and control.' : 'Build a discoverable home for your brand.'}</h2>
            <p>{adminMode
              ? 'Review business identities, verification requests, reports, and platform security from one protected operations workspace.'
              : 'Manage your public profile, showcase products, publish updates, and connect directly with people discovering your business.'}</p>
            <div className="auth-story-points">
              <div><span><Building2 size={18} /></span><div><strong>{adminMode ? 'Brand registry' : 'Professional storefront'}</strong><small>{adminMode ? 'Review every business joining the network.' : 'Present your identity, products, and direct contact details.'}</small></div></div>
              <div><span><Search size={18} /></span><div><strong>{adminMode ? 'Trust operations' : 'Search visibility'}</strong><small>{adminMode ? 'Resolve reports and verification requests efficiently.' : 'Create permanent pages search engines can discover.'}</small></div></div>
              <div><span><BarChart3 size={18} /></span><div><strong>{adminMode ? 'Security visibility' : 'Business insights'}</strong><small>{adminMode ? 'Monitor protected actions and platform health.' : 'Understand how people interact with your brand presence.'}</small></div></div>
            </div>
          </div>
          <div className="auth-story-footer"><span>BRANDSCOPE</span><small>Where Brands Get Discovered.</small></div>
        </section>

        <section className="auth-form-column">
          <div className="auth-form-heading">
            <span className="auth-kicker"><ShieldCheck size={14} /> {adminMode ? 'Platform operations' : 'Secure brand workspace'}</span>
            <h1>{adminMode ? 'Administrator sign in' : 'Welcome back'}</h1>
            <p>{adminMode ? 'Use an authorized administrator account to continue.' : 'Sign in to manage your profile, products, posts, and business connections.'}</p>
          </div>

          <div className="card auth-card auth-login-card">
            {error && <div className="auth-error"><AlertCircle size={17} /><span>{error}</span></div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Business email</label>
                <div className="auth-input-wrap">
                  <Mail size={17} className="auth-input-icon" />
                  <input id="login-email" type="email" required autoComplete="email" className="form-input" placeholder="contact@yourbrand.com" value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <div className="auth-label-row"><label className="form-label" htmlFor="login-password">Password</label><Link to="/forgot-password">Forgot password?</Link></div>
                <div className="auth-input-wrap">
                  <Lock size={17} className="auth-input-icon" />
                  <input id="login-password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" className="form-input" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} />
                  <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <label className="auth-remember-row">
                <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                <span><strong>Remember me</strong><small>Keep this device signed in until you log out.</small></span>
              </label>

              <button type="submit" disabled={loading} className="btn btn-primary btn-block auth-submit-btn">
                <span>{loading ? 'Signing you in...' : adminMode ? 'Enter platform operations' : 'Sign in to workspace'}</span>
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>
          </div>

          <div className="auth-form-footer">
            {adminMode ? <><Link to="/login">Brand owner sign in</Link><span>Administrator access is role-protected.</span></> : <span>New to BRANDSCOPE? <Link to="/signup">Create your brand profile</Link></span>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
