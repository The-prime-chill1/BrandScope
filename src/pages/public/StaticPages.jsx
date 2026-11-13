import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Compass,
  ExternalLink,
  FileCheck2,
  Globe2,
  Handshake,
  LifeBuoy,
  LockKeyhole,
  Mail,
  Network,
  Scale,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Seo } from '../../components/common/Seo';
import { SelectField } from '../../components/common/SelectField';
import { dataStore } from '../../services/dataStore';

export const AboutPage = () => (
  <main className="public-page about-page">
    <Seo
      title="About BRANDSCOPE"
      description="BRANDSCOPE is a public discovery network built exclusively for businesses, brands, startups, makers, and companies."
      canonicalPath="/about"
    />

    <section className="public-hero public-hero--about">
      <div className="container public-hero-layout">
        <div className="public-hero-content">
          <span className="public-hero-kicker"><Compass size={14} /> Our reason for building</span>
          <h1>A clearer internet for discovering real businesses.</h1>
          <p>BRANDSCOPE gives brands a credible public home—and gives everyone else a direct way to find, understand, and contact them.</p>
          <div className="public-hero-actions">
            <Link to="/discover" className="btn btn-primary">Explore brands <ArrowRight size={16} /></Link>
            <Link to="/signup" className="btn btn-outline-light">Create a brand profile</Link>
          </div>
        </div>
        <div className="about-hero-card">
          <span><ShieldCheck size={20} /></span>
          <small>BRANDSCOPE principle</small>
          <strong>Visitors browse freely. Businesses publish authentically.</strong>
          <p>No consumer posting accounts. No anonymous marketplace listings. Commercial identity comes first.</p>
        </div>
      </div>
    </section>

    <section className="public-section about-story-section">
      <div className="container about-story-grid">
        <article className="about-story-copy">
          <span className="section-eyebrow">The problem</span>
          <h2>Good businesses are too often difficult to find and harder to trust.</h2>
          <p>Most social platforms are optimized for personalities, entertainment, and short-lived attention. Business profiles compete with unrelated noise, while small brands often lack the time or budget to build a polished website.</p>
          <p>BRANDSCOPE creates a dedicated commercial layer: one place for a business identity, catalog, official updates, verification status, and direct customer contact.</p>
        </article>
        <aside className="about-story-stat-card">
          <div><Globe2 size={18} /><span><strong>Public by design</strong><small>Visitors never need an account to browse.</small></span></div>
          <div><Building2 size={18} /><span><strong>Business-only membership</strong><small>Publishing belongs to brands and companies.</small></span></div>
          <div><Network size={18} /><span><strong>Direct connection</strong><small>WhatsApp, websites, and storefronts remain one click away.</small></span></div>
        </aside>
      </div>
    </section>

    <section className="public-section about-values-section">
      <div className="container">
        <div className="public-section-heading">
          <div>
            <span className="section-eyebrow">What guides the platform</span>
            <h2>Discovery with commercial integrity.</h2>
          </div>
        </div>
        <div className="about-value-grid">
          <article><span><Compass size={21} /></span><h3>Discoverability</h3><p>Public brand pages are structured to remain useful, shareable, and search-engine friendly.</p></article>
          <article><span><ShieldCheck size={21} /></span><h3>Authenticity</h3><p>Clear identity, transparent contact channels, and editorial verification help visitors make informed decisions.</p></article>
          <article><span><Handshake size={21} /></span><h3>Direct commerce</h3><p>BRANDSCOPE introduces people to brands; each brand owns its customer relationship and transaction terms.</p></article>
        </div>
      </div>
    </section>

    <section className="container technology-partner-card">
      <div className="technology-partner-mark"><Network size={26} /></div>
      <div>
        <span className="section-eyebrow">Technology partner and credit</span>
        <h2>Built and powered by CHILL TECH LTD.</h2>
        <p>CHILL TECH LTD provides the product engineering, cloud architecture, security practices, and ongoing platform development behind BRANDSCOPE.</p>
      </div>
      <a href="https://chilltechltd.com" target="_blank" rel="noopener noreferrer" className="btn btn-outline">Visit CHILL TECH LTD <ExternalLink size={15} /></a>
    </section>
  </main>
);

export const ContactPage = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState({ inquiryType: 'general', name: '', email: user?.email || '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await dataStore.submitSupportInquiry(form, user);
      setSubmitted(true);
      addToast('Your inquiry is now in the administrator support inbox.', 'success');
    } catch (error) {
      addToast(error.message || 'The inquiry could not be submitted. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="public-page contact-page">
      <Seo
        title="Contact and Support"
        description="Contact BRANDSCOPE for platform support, verification questions, technical help, and business partnerships."
        canonicalPath="/contact"
      />

      <section className="public-hero public-hero--compact public-hero--contact">
        <div className="container public-hero-content public-hero-content--centered">
          <span className="public-hero-kicker"><LifeBuoy size={14} /> Contact and support</span>
          <h1>Tell us how we can help.</h1>
          <p>Reach the BRANDSCOPE team for account support, verification guidance, platform questions, or commercial partnerships.</p>
        </div>
      </section>

      <section className="public-section contact-content-section">
        <div className="container contact-layout">
          <aside className="contact-info-panel">
            <span className="section-eyebrow section-eyebrow--light">Support desk</span>
            <h2>Send the right context and we will route it correctly.</h2>
            <p>Include your brand name, registered email, and any relevant page link so the team can investigate efficiently.</p>
            <div className="contact-info-list">
              <div><span><Clock3 size={17} /></span><div><strong>Response target</strong><small>Within one business day</small></div></div>
              <div><span><ShieldCheck size={17} /></span><div><strong>Verification help</strong><small>Document and review guidance</small></div></div>
              <div><span><Mail size={17} /></span><div><strong>Platform inquiries</strong><small>Accounts, listings, and partnerships</small></div></div>
            </div>
            <p className="contact-info-note">For reports about a specific profile or post, use the Report control on that content so it reaches the moderation queue with the correct reference.</p>
            <Link to="/faq" className="contact-faq-link"><CircleHelp size={16} /> Check frequently asked questions <ArrowRight size={14} /></Link>
          </aside>

          <div className="contact-form-card">
            {submitted ? (
              <div className="contact-success-state">
                <span><CheckCircle2 size={28} /></span>
                <h2>Message received</h2>
                <p>Thank you, {form.name}. A BRANDSCOPE representative will follow up at <strong>{form.email}</strong>.</p>
                <button type="button" className="btn btn-outline" onClick={() => setSubmitted(false)}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="contact-form-heading">
                  <span className="section-eyebrow">New inquiry</span>
                  <h2>Contact BRANDSCOPE</h2>
                  <p>All fields are required.</p>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-type">What do you need help with?</label>
                  <SelectField
                    id="contact-type"
                    value={form.inquiryType}
                    ariaLabel="Inquiry type"
                    options={[
                      { value: 'general', label: 'General platform question' },
                      { value: 'account', label: 'Account or sign-in help' },
                      { value: 'verification', label: 'Business verification' },
                      { value: 'technical', label: 'Technical issue' },
                      { value: 'partnership', label: 'Partnership or media inquiry' },
                      { value: 'report', label: 'Safety or abuse concern' }
                    ]}
                    onChange={(nextValue) => updateField('inquiryType', nextValue)}
                  />
                </div>
                <div className="contact-form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-name">Your name</label>
                    <input id="contact-name" type="text" required className="form-input" placeholder="Your full name" value={form.name} onChange={(event) => updateField('name', event.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-email">Business email</label>
                    <input id="contact-email" type="email" required className="form-input" placeholder="name@company.com" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-subject">Subject</label>
                  <input id="contact-subject" type="text" required className="form-input" placeholder="Account, verification, support, or partnership" value={form.subject} onChange={(event) => updateField('subject', event.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-message">Message</label>
                  <textarea id="contact-message" required rows={6} className="form-textarea" placeholder="Describe what you need help with and include any relevant brand or page link." value={form.message} onChange={(event) => updateField('message', event.target.value)} />
                </div>
                <button type="submit" disabled={submitting} className="btn btn-primary btn-block contact-submit-button"><Send size={16} /> {submitting ? 'Sending to support...' : 'Send inquiry'}</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

const LegalPageShell = ({ title, description, updated, icon: Icon, canonicalPath, children }) => (
  <main className="public-page legal-page">
    <Seo title={title} description={description} canonicalPath={canonicalPath} />
    <section className="legal-hero">
      <div className="container legal-hero-inner">
        <span className="legal-hero-icon"><Icon size={23} /></span>
        <div>
          <span className="public-hero-kicker">BRANDSCOPE policy</span>
          <h1>{title}</h1>
          <p>{description}</p>
          <small>Last updated: {updated}</small>
        </div>
      </div>
    </section>
    <section className="legal-content-section">
      <div className="container legal-layout">
        <nav className="legal-side-nav" aria-label="Legal pages">
          <span>Policy library</span>
          <Link to="/privacy" className={canonicalPath === '/privacy' ? 'active' : ''}>Privacy policy</Link>
          <Link to="/terms" className={canonicalPath === '/terms' ? 'active' : ''}>Terms of service</Link>
          <Link to="/guidelines" className={canonicalPath === '/guidelines' ? 'active' : ''}>Community guidelines</Link>
          <Link to="/contact">Contact support</Link>
        </nav>
        <article className="legal-document">{children}</article>
      </div>
    </section>
  </main>
);

const LegalSection = ({ number, title, children }) => (
  <section className="legal-section">
    {number && <span>{number}</span>}
    <div><h2>{title}</h2>{children}</div>
  </section>
);

export const PrivacyPage = () => (
  <LegalPageShell
    title="Privacy Policy"
    description="How BRANDSCOPE handles account data, public business information, uploaded media, and visitor interactions."
    updated="November 2026"
    icon={LockKeyhole}
    canonicalPath="/privacy"
  >
    <LegalSection number="01" title="Commercial identity data">
      <p>BRANDSCOPE collects commercial information—including business names, official logos, registered categories, contact links, and business descriptions—to establish public business listings. We do not sell personal browsing history to third-party data brokers.</p>
    </LegalSection>
    <LegalSection number="02" title="Third-party brand interactions">
      <p>When you open a WhatsApp number, email address, external website, or another contact channel published by a brand, you leave BRANDSCOPE. Information or payment details shared directly with that brand are governed by the brand's own privacy practices.</p>
    </LegalSection>
    <LegalSection number="03" title="Account security and media storage">
      <p>Authentication, business records, and uploaded media are handled through Supabase. Access is protected with database row-level security, scoped storage policies, and account sessions. BRANDSCOPE does not process purchases made directly between visitors and listed brands.</p>
    </LegalSection>
    <LegalSection number="04" title="Public visibility and indexing">
      <p>Information published on public brand profiles, catalogs, and brand feed posts is accessible without authentication and may be indexed by search engines. Private account settings, verification documents, and administrative records remain protected.</p>
    </LegalSection>
  </LegalPageShell>
);

export const TermsPage = () => (
  <LegalPageShell
    title="Terms of Service"
    description="The rules governing business eligibility, publishing, verification, and third-party transactions on BRANDSCOPE."
    updated="November 2026"
    icon={Scale}
    canonicalPath="/terms"
  >
    <LegalSection number="01" title="Commercial eligibility">
      <p>Accounts may only be registered by legitimate commercial brands, incorporated companies, startups, licensed agencies, artisanal shops, and commercial creators. Personal consumer publishing accounts are not supported.</p>
    </LegalSection>
    <div className="legal-callout">
      <span><ShieldCheck size={20} /></span>
      <div>
        <h2>Platform role and third-party transaction disclaimer</h2>
        <p>BRANDSCOPE is a discovery, showcase, and networking platform. It is not a broker, vendor, retail store, payment intermediary, or escrow agent for transactions between visitors and listed brands.</p>
        <ul>
          <li><strong>Independent contract:</strong> Every purchase, agreement, or service engagement is solely between the visitor and the respective brand.</li>
          <li><strong>No refund obligation:</strong> Refunds, chargebacks, exchanges, defects, delays, and delivery disputes must be resolved directly with the brand.</li>
          <li><strong>No product warranty:</strong> BRANDSCOPE does not inspect, guarantee, insure, or fulfill third-party goods and services.</li>
        </ul>
      </div>
    </div>
    <LegalSection number="03" title="Editorial verification policy">
      <p>Verification badges are granted through editorial review of corporate documentation by authorized BRANDSCOPE administrators. Verification cannot be purchased.</p>
    </LegalSection>
    <LegalSection number="04" title="Member publishing responsibility">
      <p>Businesses publish and manage their own directory profiles, catalogs, and updates. Each business is responsible for the accuracy, legality, availability, and commercial terms of what it publishes.</p>
    </LegalSection>
    <LegalSection number="05" title="Limitation of liability">
      <p>To the maximum extent permitted by applicable law, BRANDSCOPE and CHILL TECH LTD are not liable for direct, indirect, punitive, or consequential damages resulting from communications, contracts, or disputes between visitors and third-party brands listed on the platform.</p>
    </LegalSection>
  </LegalPageShell>
);

export const GuidelinesPage = () => (
  <LegalPageShell
    title="Community and Trust Guidelines"
    description="The standards that keep BRANDSCOPE useful, authentic, professional, and safe for business discovery."
    updated="November 2026"
    icon={FileCheck2}
    canonicalPath="/guidelines"
  >
    <LegalSection number="01" title="Zero tolerance for impersonation">
      <p>Claiming a brand name, trademark, executive identity, or company record that belongs to another organization is prohibited and may result in immediate account suspension or termination.</p>
    </LegalSection>
    <LegalSection number="02" title="Authentic commercial content">
      <p>Posts should represent legitimate business updates, product releases, educational insights, or company news. Businesses must clearly disclose their own fulfillment, warranty, pricing, and refund terms through their published channels.</p>
    </LegalSection>
    <LegalSection number="03" title="Professional conduct">
      <p>Harassment, hate speech, deceptive claims, malicious links, coordinated spam, and misuse of another organization's intellectual property are not permitted.</p>
    </LegalSection>
    <LegalSection number="04" title="Disputes and reporting">
      <p>Payment, delivery, and refund disputes must be resolved with the brand's customer-service channels. Suspected fraud, impersonation, or harmful content can be submitted through the relevant Report control for editorial review.</p>
    </LegalSection>
  </LegalPageShell>
);
