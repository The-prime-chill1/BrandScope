import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../services/dataStore';
import { Logo } from '../../components/common/Logo';
import { BrandCard } from '../../components/brand/BrandCard';
import { ImageUploader } from '../../components/common/ImageUploader';
import { getSiteHost } from '../../lib/site';
import { 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Globe, 
  MapPin, 
  Image, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Check,
  Store,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';

export const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const publicSiteHost = getSiteHost();

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Account details
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Step 2: Brand details & Registration Category
  const [brandType, setBrandType] = useState('small'); // 'small' (ShopSharp/Jiji quick setup) or 'enterprise' (Shopify/Corporate verified)
  const [brandName, setBrandName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState(dataStore.categories[0]?.name || 'Technology');
  const [shortDescription, setShortDescription] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [city, setCity] = useState('Lagos');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');
  const [cacNumber, setCacNumber] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');

  // Step 3: Brand identity (Device photo upload)
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // Auto-generate slug from brand name
  const handleBrandNameChange = (val) => {
    setBrandName(val);
    const gen = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setSlug(gen);
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!contactName.trim() || !email.trim() || !password) {
        setError('Please complete all required account fields.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!acceptedTerms) {
        setError('You must accept the Terms of Service and Privacy Policy.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!brandName.trim() || !slug.trim() || !shortDescription.trim()) {
        setError('Please fill in your brand name, unique slug, and description.');
        return;
      }
      if (!whatsapp.trim() && !website.trim()) {
        setError('Please provide at least a WhatsApp contact number or an official website so customers can reach your brand.');
        return;
      }
      // Check slug collision
      const slugConflict = dataStore.brands.some((b) => b.slug.toLowerCase() === slug.toLowerCase());
      if (slugConflict) {
        setError(`The slug "${slug}" is already claimed. Please customize your slug.`);
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleFinishRegistration = async () => {
    setError('');
    setSubmitting(true);

    try {
      const selectedCategoryObj = dataStore.categories.find((c) => c.name === category);

      const registeredUser = await signup({
        email,
        password,
        remember,
        contactName,
        brandDetails: {
          name: brandName.trim(),
          slug: slug.trim(),
          category,
          categorySlug: selectedCategoryObj?.slug || 'technology',
          country,
          city,
          whatsapp: whatsapp.trim(),
          phone: whatsapp.trim(),
          website: website.trim(),
          cacNumber: cacNumber.trim(),
          brandType,
          verificationStatus: brandType === 'enterprise' && cacNumber.trim() ? 'pending' : 'unverified',
          documentUrl: documentUrl.trim(),
          shortDescription: shortDescription.trim(),
          logoUrl: logoUrl.trim(),
          coverUrl: coverUrl.trim()
        }
      });

      navigate(registeredUser.requiresEmailConfirmation ? `/verify-email?email=${encodeURIComponent(email)}` : '/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Preview brand object
  const previewBrand = {
    id: 'preview-id',
    name: brandName || 'Your Brand Name',
    slug: slug || 'your-brand',
    category,
    country,
    city,
    whatsapp,
    website,
    cacNumber,
    shortDescription: shortDescription || 'Your short description will appear here on your public discovery card.',
    logoUrl,
    coverUrl,
    followerCount: 0,
    verificationStatus: brandType === 'enterprise' && cacNumber.trim() ? 'pending' : 'unverified'
  };

  return (
    <div className="signup-page-shell" style={{ minHeight: '85vh', padding: 'var(--space-10) var(--space-4)' }}>
      <div className="signup-panel" style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Header */}
        <div className="signup-header" style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <Link to="/" style={{ display: 'inline-block', marginBottom: 'var(--space-3)' }}>
            <Logo size={44} />
          </Link>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Register Your Brand on BRANDSCOPE</h1>
          <p style={{ marginTop: 'var(--space-2)', fontSize: '0.95rem' }}>
            Join the global directory where brands get discovered, connect with buyers, and showcase their products.
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="signup-progress" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="signup-progress-track" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {[
              { num: 1, label: 'Account' },
              { num: 2, label: 'Brand & Type' },
              { num: 3, label: 'Media Upload' },
              { num: 4, label: 'Review & Publish' }
            ].map((s) => (
              <div className="signup-step" key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  className="signup-step-number"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: step >= s.num ? 'var(--color-blue)' : 'var(--color-bg)',
                    color: step >= s.num ? '#FFFFFF' : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: step >= s.num ? 'none' : '1px solid var(--color-border)'
                  }}
                >
                  {step > s.num ? <CheckCircle2 size={16} /> : s.num}
                </div>
                <span
                  className="signup-step-label"
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: step === s.num ? 700 : 500,
                    color: step === s.num ? 'var(--color-navy)' : 'var(--color-text-muted)'
                  }}
                >
                  {s.label}
                </span>
                {s.num < 4 && <div className="signup-step-divider" style={{ width: '20px', height: '2px', backgroundColor: 'var(--color-border)' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="card signup-card" style={{ padding: 'var(--space-8)', boxShadow: 'var(--shadow-md)' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                border: '1px solid var(--color-error-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: 'var(--space-4)'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: ACCOUNT DETAILS */}
          {step === 1 && (
            <form onSubmit={handleNextStep}>
              <h3 style={{ marginBottom: 'var(--space-4)', fontSize: '1.2rem' }}>
                Step 1: Account Access
              </h3>

              <div className="form-group">
                <label className="form-label">Contact Person's Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="e.g. Samuel Adebayo"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Business / Contact Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="email"
                    required
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="contact@mybrand.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="auth-input-wrap">
                  <Lock size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="auth-input-wrap">
                  <Lock size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <label className="auth-remember-row">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <span>
                  <strong>Remember me</strong>
                  <small>Keep this brand account signed in on this device.</small>
                </span>
              </label>

              <div style={{ margin: 'var(--space-5) 0', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="termsCheck"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  style={{ marginTop: '4px' }}
                />
                <label htmlFor="termsCheck" style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  I confirm that I represent a business or brand, and I agree to the{' '}
                  <Link to="/terms" target="_blank" style={{ textDecoration: 'underline' }}>Terms of Service</Link>,{' '}
                  <Link to="/privacy" target="_blank" style={{ textDecoration: 'underline' }}>Privacy Policy</Link>, and{' '}
                  <Link to="/guidelines" target="_blank" style={{ textDecoration: 'underline' }}>Guidelines</Link>.
                </label>
              </div>

              <button type="submit" className="btn btn-primary btn-block" style={{ gap: '6px' }}>
                <span>Continue to Brand Details</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* STEP 2: BRAND DETAILS & TYPE */}
          {step === 2 && (
            <form onSubmit={handleNextStep}>
              <h3 style={{ marginBottom: 'var(--space-2)', fontSize: '1.2rem' }}>
                Step 2: Brand Information & Registration Tier
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
                Choose your registration tier. Small brands can register instantly with zero paperwork, while corporate entities can provide registration credentials.
              </p>

              {/* Brand Type Selector (Small Brand vs Enterprise) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: 'var(--space-6)' }}>
                <div
                  onClick={() => setBrandType('small')}
                  style={{
                    border: brandType === 'small' ? '2px solid var(--color-blue)' : '1px solid var(--color-border)',
                    backgroundColor: brandType === 'small' ? '#F0F7FF' : '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Store size={20} color={brandType === 'small' ? 'var(--color-blue)' : 'var(--color-text-muted)'} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: brandType === 'small' ? 'var(--color-navy)' : 'inherit' }}>
                      Small Brand / Vendor
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    Fast registration. No corporate documents required. Post your WhatsApp link and start listing immediately.
                  </p>
                </div>

                <div
                  onClick={() => setBrandType('enterprise')}
                  style={{
                    border: brandType === 'enterprise' ? '2px solid var(--color-blue)' : '1px solid var(--color-border)',
                    backgroundColor: brandType === 'enterprise' ? '#F0F7FF' : '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <ShieldCheck size={20} color={brandType === 'enterprise' ? 'var(--color-blue)' : 'var(--color-text-muted)'} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: brandType === 'enterprise' ? 'var(--color-navy)' : 'inherit' }}>
                      Registered Corporate Entity
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    For incorporated companies. Include CAC / Reg number and documents for the official Verified Trust Badge.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Brand / Company Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Kente Modern or AfroCraft Studio"
                  value={brandName}
                  onChange={(e) => handleBrandNameChange(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unique Brand Slug *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{publicSiteHost}/brand/</span>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="my-brand"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Primary Industry Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {dataStore.categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Country & City</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="City (e.g. Lagos)"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Channels: WhatsApp and Website */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 'var(--space-5)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={16} color="#16845B" />
                  <span>Customer Contact & Order Channels</span>
                </h4>

                <div className="form-group">
                  <label className="form-label">
                    WhatsApp Contact Number {brandType === 'small' ? '*' : '(Recommended)'}
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+234 801 234 5678 or 08012345678"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                  <div className="form-hint" style={{ color: '#059669' }}>
                    Enables 1-click customer chats and product inquiries directly from your profile card!
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Official Website (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://mybrand.com (leave empty if you sell via WhatsApp only)"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                  <div className="form-hint">
                    No website? No problem! Your WhatsApp link will act as your primary direct customer ordering line.
                  </div>
                </div>
              </div>

              {/* If Corporate/Enterprise: CAC Reg Number */}
              {brandType === 'enterprise' && (
                <div className="form-group" style={{ backgroundColor: '#F0FDF4', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid #BBF7D0' }}>
                  <label className="form-label" style={{ color: '#166534', fontWeight: 700 }}>
                    Corporate Registration # (CAC / SEC / RC Number)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. RC-1849204"
                    value={cacNumber}
                    onChange={(e) => setCacNumber(e.target.value)}
                  />
                  <div className="form-hint" style={{ color: '#15803D' }}>
                    You can upload your certificate in the next step to earn the official Verified Badge.
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Short Business Description *</label>
                <textarea
                  required
                  rows={2}
                  maxLength={240}
                  className="form-textarea"
                  placeholder="Explain what products or services your brand offers..."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />
                <div className="form-hint">{shortDescription.length}/240 characters</div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: 'var(--space-6)' }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-outline" style={{ gap: '6px' }}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button type="submit" className="btn btn-primary btn-block" style={{ gap: '6px' }}>
                  <span>Continue to Media Upload</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: BRAND IDENTITY (DEVICE FILE UPLOAD) */}
          {step === 3 && (
            <form onSubmit={handleNextStep}>
              <h3 style={{ marginBottom: 'var(--space-2)', fontSize: '1.2rem' }}>
                Step 3: Upload Photos from Phone or Computer
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
                Pick images directly from your device library or camera. No image URLs required!
              </p>

              {/* Device Logo Upload */}
              <ImageUploader
                label="Brand Logo Photo *"
                hint="Select a square logo or avatar directly from your phone gallery or computer"
                value={logoUrl}
                onChange={setLogoUrl}
                maxDimension={500}
              />

              {/* Device Cover Banner Upload */}
              <ImageUploader
                label="Profile Cover Banner Photo"
                hint="Landscape photo to feature at the top of your public brand page"
                value={coverUrl}
                onChange={setCoverUrl}
                maxDimension={1200}
              />

              {/* If Enterprise: Document Photo Upload */}
              {brandType === 'enterprise' && (
                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-divider)' }}>
                  <ImageUploader
                    label="Official Registration Document / CAC Scan (Optional)"
                    hint="Upload a photo of your certificate from your phone or files for express verified approval"
                    value={documentUrl}
                    onChange={setDocumentUrl}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: 'var(--space-6)' }}>
                <button type="button" onClick={() => setStep(2)} className="btn btn-outline" style={{ gap: '6px' }}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button type="submit" className="btn btn-primary btn-block" style={{ gap: '6px' }}>
                  <span>Review & Preview Profile</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: REVIEW & PUBLISH */}
          {step === 4 && (
            <div>
              <h3 style={{ marginBottom: 'var(--space-2)', fontSize: '1.2rem' }}>
                Step 4: Review Your Brand Listing
              </h3>
              <p style={{ marginBottom: 'var(--space-6)', fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
                This is a live preview of how your brand card will appear on the BRANDSCOPE global directory:
              </p>

              <div style={{ maxWidth: '380px', margin: '0 auto var(--space-8) auto' }}>
                <BrandCard brand={previewBrand} />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setStep(3)} className="btn btn-outline" style={{ gap: '6px' }}>
                  <ArrowLeft size={16} />
                  <span>Edit Media</span>
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleFinishRegistration}
                  className="btn btn-primary btn-block"
                  style={{ gap: '6px' }}
                >
                  <Sparkles size={16} />
                  <span>{submitting ? 'Creating Brand Profile...' : 'Publish Brand to Directory'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: '0.9rem' }}>
          Already have a brand registered?{' '}
          <Link to="/login" style={{ color: 'var(--color-blue)', fontWeight: 600 }}>
            Sign In to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
