import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { ShieldCheck, Mail, Globe, Send, CheckCircle2, ExternalLink } from 'lucide-react';

export const AboutPage = () => (
  <div style={{ paddingBottom: 'var(--space-16)' }}>
    <section style={{ backgroundColor: 'var(--color-navy)', color: '#FFFFFF', padding: 'var(--space-16) 0' }}>
      <div className="container" style={{ maxWidth: '780px', textAlign: 'center' }}>
        <h1 style={{ color: '#FFFFFF', fontSize: '2.8rem', marginBottom: '16px' }}>About BRANDSCOPE</h1>
        <p style={{ color: '#CBD5E1', fontSize: '1.2rem', lineHeight: 1.6 }}>
          Where Brands Get Discovered. Built to eliminate obscurity for high-performing companies, commercial startups, and visionary makers.
        </p>
      </div>
    </section>

    <div className="container" style={{ maxWidth: '820px', marginTop: 'var(--space-12)' }}>
      <div className="card" style={{ padding: 'var(--space-10)', marginBottom: 'var(--space-8)' }}>
        <h2 style={{ marginBottom: 'var(--space-4)' }}>Our Core Mission</h2>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 'var(--space-6)' }}>
          Most social networks are optimized for individual influencers, casual entertainment, or ephemeral virality. Small-to-medium businesses and enterprise innovators are often lost behind algorithm changes and paywalled consumer noise.
        </p>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
          BRANDSCOPE was created as a dedicated, business-only network. On BRANDSCOPE, every profile represents a commercial entity. Visitors can freely discover products, inspect verified company milestones, and build lasting B2B partnerships.
        </p>
      </div>

      <div className="card" style={{ padding: 'var(--space-10)', marginBottom: 'var(--space-8)', backgroundColor: '#F8FAFC' }}>
        <h3 style={{ marginBottom: 'var(--space-3)' }}>Technology Partner & Credit</h3>
        <p style={{ lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
          BRANDSCOPE is architected, built, and powered by <strong>CHILL TECH LTD</strong>, an enterprise software engineering and technology consulting company.
        </p>
        <p style={{ lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
          CHILL TECH LTD provides cloud infrastructure, security audit compliance, and scalable platform engineering for BRANDSCOPE.
        </p>
        <a
          href="https://chilltechltd.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-sm"
          style={{ gap: '6px' }}
        >
          <span>Visit CHILL TECH LTD</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  </div>
);

export const ContactPage = () => {
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    addToast('Your inquiry has been received. Our team will follow up within 24 hours.', 'success');
  };

  return (
    <div style={{ paddingBottom: 'var(--space-16)' }}>
      <section style={{ backgroundColor: 'var(--color-navy)', color: '#FFFFFF', padding: 'var(--space-12) 0' }}>
        <div className="container" style={{ maxWidth: '640px', textAlign: 'center' }}>
          <h1 style={{ color: '#FFFFFF', fontSize: '2.5rem', marginBottom: '10px' }}>Contact & Support</h1>
          <p style={{ color: '#CBD5E1', fontSize: '1.1rem' }}>
            Reach out to our global team for enterprise partnerships, brand verification assistance, or technical inquiries.
          </p>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '720px', marginTop: 'var(--space-10)' }}>
        <div className="card" style={{ padding: 'var(--space-8)' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
              <CheckCircle2 size={48} color="#16845B" style={{ margin: '0 auto 16px auto' }} />
              <h3>Message Sent Successfully</h3>
              <p style={{ marginTop: '8px' }}>
                Thank you for contacting BRANDSCOPE. A representative will contact you at <strong>{email}</strong> shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Samuel Adebayo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Business Email</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Partnership, verification request, or support inquiry"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  required
                  rows={4}
                  className="form-textarea"
                  placeholder="How can our support team assist your brand?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" style={{ gap: '6px' }}>
                <Send size={16} />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const PrivacyPage = () => (
  <div className="container" style={{ maxWidth: '800px', padding: 'var(--space-12) var(--space-4)' }}>
    <h1 style={{ marginBottom: 'var(--space-4)' }}>Privacy Policy</h1>
    <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>Last updated: November 2026</p>

    <div className="card" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h3>1. Commercial Identity Data</h3>
        <p style={{ marginTop: '6px' }}>
          BRANDSCOPE collects commercial data (business names, official logos, registered categories, contact links, and business descriptions) to establish public business listings. We do not sell personal browsing history to third-party data brokers.
        </p>
      </div>

      <div>
        <h3>2. Third-Party Brand Interactions & Data Sharing</h3>
        <p style={{ marginTop: '6px' }}>
          When you click on external contact links, WhatsApp numbers, email addresses, or external websites listed by brands on BRANDSCOPE, you are leaving our platform. Any information, personal data, or payment details you provide directly to those brands is governed strictly by their respective privacy policies, not BRANDSCOPE's.
        </p>
      </div>

      <div>
        <h3>3. Account Security & Media Storage</h3>
        <p style={{ marginTop: '6px' }}>
          Authentication, business records, and uploaded media are handled through Supabase. Access is protected with database row-level security, scoped storage policies, and account sessions. BRANDSCOPE does not process purchases made directly between visitors and listed brands.
        </p>
      </div>

      <div>
        <h3>4. Public Visibility & Brand Content</h3>
        <p style={{ marginTop: '6px' }}>
          Information published on public brand profiles, catalogs, and brand feed posts is openly indexed and accessible to all visitors without requiring authentication. Private account settings and administrative logs remain strictly protected.
        </p>
      </div>
    </div>
  </div>
);

export const TermsPage = () => (
  <div className="container" style={{ maxWidth: '800px', padding: 'var(--space-12) var(--space-4)' }}>
    <h1 style={{ marginBottom: 'var(--space-4)' }}>Terms of Service</h1>
    <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>Last updated: November 2026</p>

    <div className="card" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h3>1. Commercial Eligibility</h3>
        <p style={{ marginTop: '6px' }}>
          Accounts on BRANDSCOPE may only be registered by legitimate commercial brands, incorporated companies, startups, licensed agencies, artisanal shops, and commercial creators. Personal consumer accounts are not supported.
        </p>
      </div>

      <div style={{ backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ color: 'var(--color-warning)' }}>2. Platform Role & Third-Party Transaction Disclaimer (Zero-Liability for Brand Deals)</h3>
        <p style={{ marginTop: '8px', color: 'var(--color-text-primary)', fontWeight: 500 }}>
          BRANDSCOPE is strictly a discovery, showcase, and networking platform. BRANDSCOPE is <strong>NOT</strong> a broker, vendor, retail store, payment intermediary, or escrow agent for transactions between visitors/users and listed brands.
        </p>
        <p style={{ marginTop: '8px', color: 'var(--color-text-primary)' }}>
          If you discover a brand on BRANDSCOPE and subsequently communicate, order products, hire services, or send funds to that brand:
        </p>
        <ul style={{ paddingLeft: '20px', marginTop: '8px', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
          <li><strong>Independent Contract:</strong> Any purchase, agreement, contract, or transaction is exclusively and solely between you and the respective brand.</li>
          <li><strong>No Refund Obligation:</strong> BRANDSCOPE has <strong>no business, involvement, or liability</strong> regarding refunds, chargebacks, exchanges, product defects, delays, or undelivered services. <strong>Any refund request is strictly between you and the brand.</strong></li>
          <li><strong>No Warranty:</strong> BRANDSCOPE does not warrant, inspect, guarantee, or insure third-party goods, services, or fulfillment.</li>
        </ul>
      </div>

      <div>
        <h3>3. Editorial Verification Policy</h3>
        <p style={{ marginTop: '6px' }}>
          Verification badges are granted solely through editorial and corporate documentation inspection by authorized BRANDSCOPE administrators. Verification cannot be purchased.
        </p>
      </div>

      <div>
        <h3>4. Member Publishing</h3>
        <p style={{ marginTop: '6px' }}>
          Businesses publish and manage their own directory profiles, catalogs, and updates. Each business is responsible for the accuracy and legality of the content and commercial terms it publishes.
        </p>
      </div>

      <div>
        <h3>5. Limitation of Liability</h3>
        <p style={{ marginTop: '6px' }}>
          To the maximum extent permitted by applicable law, BRANDSCOPE and CHILL TECH LTD shall not be liable for any direct, indirect, punitive, or consequential damages resulting from communications, contracts, or disputes arising between users and any third-party brands listed on the platform.
        </p>
      </div>
    </div>
  </div>
);

export const GuidelinesPage = () => (
  <div className="container" style={{ maxWidth: '800px', padding: 'var(--space-12) var(--space-4)' }}>
    <h1 style={{ marginBottom: 'var(--space-4)' }}>Community & Trust Guidelines</h1>
    <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>Last updated: October 2026</p>

    <div className="card" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h3>Zero Tolerance for Impersonation</h3>
        <p style={{ marginTop: '6px' }}>
          Attempting to claim or register a brand name, trademark, or executive identity belonging to another organization is strictly prohibited and results in immediate account termination.
        </p>
      </div>

      <div>
        <h3>Authentic Commercial Content & Transparent Terms</h3>
        <p style={{ marginTop: '6px' }}>
          Brand posts must represent legitimate business updates, product releases, educational insights, or company news. Brands are required to clearly disclose their own fulfillment, warranty, and refund terms on their respective websites or communication channels.
        </p>
      </div>

      <div>
        <h3>Dispute Resolution</h3>
        <p style={{ marginTop: '6px' }}>
          Because BRANDSCOPE does not sell or broker products on behalf of brands, disputes regarding payments, delivery, or refunds must be resolved directly with the brand's customer service channels. Suspected fraudulent brands can be reported via our Abuse Report form for editorial review and potential platform expulsion.
        </p>
      </div>
    </div>
  </div>
);
