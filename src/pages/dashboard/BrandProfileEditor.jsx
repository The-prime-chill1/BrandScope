import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../services/dataStore';
import { useToast } from '../../contexts/ToastContext';
import { BrandCard } from '../../components/brand/BrandCard';
import { Save, AlertCircle, Globe, Building2, Image } from 'lucide-react';
import { ImageUploader } from '../../components/common/ImageUploader';
import { getSiteHost } from '../../lib/site';

export const BrandProfileEditor = () => {
  const { user, currentBrand, refreshBrand } = useAuth();
  const { addToast } = useToast();
  const publicSiteHost = getSiteHost();

  const [name, setName] = useState(currentBrand?.name || '');
  const [slug, setSlug] = useState(currentBrand?.slug || '');
  const [category, setCategory] = useState(currentBrand?.category || 'Technology');
  const [country, setCountry] = useState(currentBrand?.country || 'Nigeria');
  const [city, setCity] = useState(currentBrand?.city || '');
  const [website, setWebsite] = useState(currentBrand?.website || '');
  const [shortDescription, setShortDescription] = useState(currentBrand?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(currentBrand?.fullDescription || '');
  const [logoUrl, setLogoUrl] = useState(currentBrand?.logoUrl || '');
  const [coverUrl, setCoverUrl] = useState(currentBrand?.coverUrl || '');
  const [twitter, setTwitter] = useState(currentBrand?.socials?.twitter || '');
  const [linkedin, setLinkedin] = useState(currentBrand?.socials?.linkedin || '');
  const [instagram, setInstagram] = useState(currentBrand?.socials?.instagram || '');
  const [whatsapp, setWhatsapp] = useState(currentBrand?.whatsapp || '');
  const [phone, setPhone] = useState(currentBrand?.phone || '');
  const [cacNumber, setCacNumber] = useState(currentBrand?.cacNumber || '');
  const [address, setAddress] = useState(currentBrand?.address || '');
  const [deliveryInfo, setDeliveryInfo] = useState(currentBrand?.deliveryInfo || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!currentBrand) {
    return <div className="card" style={{ padding: '24px' }}>No brand profile found.</div>;
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !slug.trim()) {
      setError('Brand name and unique slug are required.');
      return;
    }

    setSaving(true);
    try {
      const selectedCategoryObj = dataStore.categories.find((c) => c.name === category);

      await dataStore.updateBrand(
        currentBrand.id,
        {
          name: name.trim(),
          slug: slug.trim(),
          category,
          categorySlug: selectedCategoryObj?.slug || 'technology',
          country,
          city,
          website: website.trim(),
          whatsapp: whatsapp.trim(),
          phone: phone.trim(),
          cacNumber: cacNumber.trim(),
          address: address.trim(),
          deliveryInfo: deliveryInfo.trim(),
          shortDescription: shortDescription.trim(),
          fullDescription: fullDescription.trim(),
          logoUrl: logoUrl.trim(),
          coverUrl: coverUrl.trim(),
          socials: {
            twitter: twitter.trim(),
            linkedin: linkedin.trim(),
            instagram: instagram.trim()
          }
        },
        user.uid
      );
      await refreshBrand();
      addToast('Brand profile updated successfully!', 'success');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      addToast(err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const previewBrand = {
    ...currentBrand,
    name,
    slug,
    category,
    country,
    city,
    shortDescription,
    logoUrl,
    coverUrl
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Edit Brand Profile</h1>
        <p style={{ marginTop: '4px', fontSize: '0.9rem' }}>
          Keep your company presentation up to date for prospective clients and industry partners.
        </p>
      </div>

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
            marginBottom: 'var(--space-6)'
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 'var(--space-8)' }}>
        {/* Editor Form */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Brand Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Brand Slug (URL)</label>
              <input
                type="text"
                required
                className="form-input"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
              />
              <div className="form-hint">Public link: {publicSiteHost}/brand/{slug}</div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Industry Category</label>
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
                <label className="form-label">Country</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Website (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://company.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
                <div className="form-hint" style={{ color: '#059669' }}>
                  No website? You can leave this blank and use your WhatsApp number below as your direct store link!
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Short Description (for discovery cards)</label>
              <textarea
                rows={2}
                maxLength={240}
                className="form-textarea"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full About / Company Mission</label>
              <textarea
                rows={4}
                className="form-textarea"
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
              />
            </div>

            <div style={{ marginTop: 'var(--space-5)' }}>
              <ImageUploader
                label="Brand Logo from Device"
                hint="Square aspect ratio recommended. Pick directly from phone gallery or computer files."
                value={logoUrl}
                onChange={setLogoUrl}
                maxDimension={600}
              />
            </div>

            <div style={{ marginTop: 'var(--space-3)' }}>
              <ImageUploader
                label="Cover Banner Image from Device"
                hint="Wide landscape photo for your brand profile header (1200x400 recommended)."
                value={coverUrl}
                onChange={setCoverUrl}
                maxDimension={1400}
              />
            </div>

            <h4 style={{ margin: 'var(--space-6) 0 var(--space-4) 0' }}>Commercial Trust & Instant Commerce</h4>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">WhatsApp Business Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+234 801 234 5678"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
                <div className="form-hint">Enables direct 1-click WhatsApp customer ordering</div>
              </div>

              <div className="form-group">
                <label className="form-label">Direct Phone Hotline</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+234 1 234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">CAC Corporate Registration</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. RC-1849201 or BN-2938102"
                  value={cacNumber}
                  onChange={(e) => setCacNumber(e.target.value)}
                />
                <div className="form-hint">Displays verified CAC legal entity badge</div>
              </div>

              <div className="form-group">
                <label className="form-label">Delivery & Fulfillment Speed</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Lagos 24hr / Nationwide via DHL"
                  value={deliveryInfo}
                  onChange={(e) => setDeliveryInfo(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Physical Office / Showroom Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Plot 12, Admiralty Way, Lekki Phase 1, Lagos"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <h4 style={{ margin: 'var(--space-6) 0 var(--space-4) 0' }}>Social Channels</h4>
            <div className="form-group">
              <input
                type="url"
                className="form-input"
                placeholder="Twitter / X profile link"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                style={{ marginBottom: '8px' }}
              />
              <input
                type="url"
                className="form-input"
                placeholder="LinkedIn company page"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                style={{ marginBottom: '8px' }}
              />
              <input
                type="url"
                className="form-input"
                placeholder="Instagram handle link"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary btn-block" style={{ gap: '6px' }}>
              <Save size={16} />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Live Preview Card */}
        <div>
          <div style={{ position: 'sticky', top: '90px' }}>
            <h4 style={{ marginBottom: 'var(--space-3)' }}>Live Discovery Preview</h4>
            <BrandCard brand={previewBrand} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandProfileEditor;
