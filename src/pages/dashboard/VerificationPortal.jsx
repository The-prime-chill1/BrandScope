import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dataStore } from '../../services/dataStore';
import { 
  ShieldCheck, 
  FileText, 
  Building2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Upload, 
  ExternalLink,
  Award,
  BadgeCheck,
  Check
} from 'lucide-react';
import { ImageUploader } from '../../components/common/ImageUploader';

export const VerificationPortal = () => {
  const { user, currentBrand, refreshBrand } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    businessRegNumber: currentBrand?.cacNumber || '',
    taxId: '',
    legalEntityName: currentBrand?.name || '',
    registeredAddress: currentBrand?.showroomAddress || currentBrand?.location || '',
    directorName: '',
    idType: 'nin',
    idNumber: '',
    documentUrl: '',
    websiteDomain: currentBrand?.website || '',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(currentBrand?.verificationStatus === 'pending' || currentBrand?.verificationStatus === 'verified');

  if (!currentBrand) return null;

  const isVerified = currentBrand.verificationStatus === 'verified';
  const isPending = submitted || currentBrand.verificationStatus === 'pending' || dataStore.verificationRequests.some((request) => request.brandId === currentBrand.id && request.status === 'pending');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.businessRegNumber || !formData.legalEntityName) {
      addToast('Please provide your official legal entity name and registration number', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await dataStore.submitVerificationRequest(currentBrand.id, formData, user.uid);
      await refreshBrand();
      setSubmitting(false);
      setSubmitted(true);
      addToast('Verification dossier submitted for compliance review.', 'success');
    } catch (error) {
      setSubmitting(false);
      addToast(error.message || 'Could not submit your verification request.', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '840px' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-blue)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <ShieldCheck size={14} />
          <span>Trust & Identity Compliance</span>
        </div>
        <h1 style={{ fontSize: '1.8rem', margin: '4px 0 0 0' }}>Brand Verification & Credentialing</h1>
        <p style={{ marginTop: '4px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Get verified to earn the official blue aperture badge, rank higher in discovery, and unlock commercial buyer trust.
        </p>
      </div>

      {/* Verification Status Card */}
      {isVerified ? (
        <div
          className="card"
          style={{
            padding: 'var(--space-6)',
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            marginBottom: 'var(--space-8)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', flexShrink: 0 }}>
            <BadgeCheck size={28} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#166534' }}>
              Officially Verified Brand
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#15803D' }}>
              Your business identity and legal incorporation have been verified by BRANDSCOPE Trust & Compliance. The verified seal is displayed across your profile, directory cards, and search engine snippets.
            </p>
          </div>
        </div>
      ) : isPending ? (
        <div
          className="card"
          style={{
            padding: 'var(--space-6)',
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            marginBottom: 'var(--space-8)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B45309', flexShrink: 0 }}>
            <Clock size={28} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#92400E' }}>
              Verification Dossier Under Review
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#B45309' }}>
              Our compliance team is inspecting your corporate credentials and registry documents. Most reviews are completed within 24 to 48 business hours.
            </p>
          </div>
        </div>
      ) : null}

      {/* Benefits Overview */}
      <div className="grid-3" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="card" style={{ padding: 'var(--space-5)', backgroundColor: '#FFFFFF' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-blue)', marginBottom: '12px' }}>
            <BadgeCheck size={20} />
          </div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem' }}>Verified Trust Seal</h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
            Official blue aperture badge displayed on all brand posts, products, and directory listings.
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', backgroundColor: '#FFFFFF' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16845B', marginBottom: '12px' }}>
            <Award size={20} />
          </div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem' }}>Priority Discovery</h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
            Verified brands rank higher when buyers filter by "Verified Only" on the global discovery feed.
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', backgroundColor: '#FFFFFF' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', marginBottom: '12px' }}>
            <Building2 size={20} />
          </div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem' }}>CAC / Commercial Trust</h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
            Verified registration numbers give international buyers peace of mind before contacting your brand.
          </p>
        </div>
      </div>

      {/* Verification Submission Form */}
      {!isVerified && (
        <div className="card" style={{ padding: 'var(--space-8)', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ margin: '0 0 var(--space-2) 0', fontSize: '1.25rem' }}>
            Submit Business Credentials
          </h3>
          <p style={{ margin: '0 0 var(--space-6) 0', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
            Information submitted is encrypted and reviewed exclusively by authorized BRANDSCOPE compliance officers.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Official Legal Entity Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kente Modern Design Studios Ltd"
                  value={formData.legalEntityName}
                  onChange={(e) => setFormData({ ...formData, legalEntityName: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Corporate Registration # (CAC / Tax ID / SEC) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RC-1849204 or BN-39201"
                  value={formData.businessRegNumber}
                  onChange={(e) => setFormData({ ...formData, businessRegNumber: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Managing Director / Signatory Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kwame Mensah"
                  value={formData.directorName}
                  onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Identity Document Type
                </label>
                <select
                  value={formData.idType}
                  onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                >
                  <option value="nin">National Identification Number (NIN / National e-ID)</option>
                  <option value="passport">International Passport</option>
                  <option value="cac_cert">Certificate of Incorporation</option>
                  <option value="drivers_license">Driver's License</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  ID / Document Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 11-digit NIN or Passport Number"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Corporate Website Domain
                </label>
                <input
                  type="url"
                  placeholder="https://yourbrand.com"
                  value={formData.websiteDomain}
                  onChange={(e) => setFormData({ ...formData, websiteDomain: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Showroom or Official Operating Address
              </label>
              <input
                type="text"
                placeholder="e.g. 14 Victoria Island Boulevard, Lagos, Nigeria"
                value={formData.registeredAddress}
                onChange={(e) => setFormData({ ...formData, registeredAddress: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <ImageUploader
                label="Official Document / Certificate Photo from Device"
                hint="Upload a clear photo or scan of your CAC Certificate, Tax Clearance, or Government ID from your device library"
                value={formData.documentUrl}
                onChange={(img) => setFormData({ ...formData, documentUrl: img })}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{
                marginTop: '10px',
                padding: '12px 24px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ShieldCheck size={18} />
              <span>{submitting ? 'Submitting Credentials...' : isPending ? 'Update Verification Dossier' : 'Submit for Verification'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default VerificationPortal;
