import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, ChevronDown, CircleHelp, MessageSquareText, ShieldCheck } from 'lucide-react';
import { Seo } from '../../components/common/Seo';

const FAQ_GROUPS = [
  {
    title: 'Joining BRANDSCOPE',
    icon: Building2,
    questions: [
      ['Who can create an account?', 'Accounts are for legitimate businesses, brands, startups, makers, agencies, and companies. Ordinary visitors can browse every public directory page without signing up.'],
      ['Do I need a business website?', 'No. A website is optional. Your public profile can use WhatsApp, a direct phone number, a business email, a website, or any combination of those contact channels.'],
      ['Can I upload images directly from my phone?', 'Yes. Logos, cover photos, product images, verification documents, and brand posts can be selected from your phone gallery, camera, or computer. BRANDSCOPE optimizes the image before securely uploading it.'],
      ['Can a small maker join without corporate paperwork?', 'Yes. The fast-track onboarding option lets a small brand or maker start with core brand and contact information. Corporate documents are only required when requesting editorial verification.'],
      ['How do I reset my password?', 'Use “Forgot password?” on the sign-in page. BRANDSCOPE will send a secure recovery link to the email address attached to your account.']
    ]
  },
  {
    title: 'Profiles, publishing, and discovery',
    icon: ShieldCheck,
    questions: [
      ['How does verification work?', 'Registered companies can submit incorporation or government-issued documentation through the verification portal. An authorized administrator reviews the request before granting a verified badge. Verification cannot be purchased.'],
      ['Who creates brand posts and product listings?', 'Each registered business manages and publishes its own profile, catalog, and updates. BRANDSCOPE does not fill the directory with advertisements or publish products on a brand’s behalf.'],
      ['Will my BRANDSCOPE page appear on Google?', 'Public brand, product, and post pages include crawlable URLs, canonical metadata, structured data, and sitemap discovery. Google ultimately decides when and where a page appears, so indexing and ranking cannot be guaranteed immediately.'],
      ['Can visitors order directly?', 'Visitors can use the WhatsApp contact and order actions provided by a brand. Any resulting purchase or service agreement is directly between the visitor and that business.']
    ]
  },
  {
    title: 'Support, safety, and installation',
    icon: MessageSquareText,
    questions: [
      ['Where does a contact inquiry go?', 'The Contact and Support form saves the inquiry to the private administrator support inbox. Only authorized BRANDSCOPE administrators can read or update it.'],
      ['How do I report suspicious content?', 'Use the Report control on the relevant profile or post. This includes the correct content reference and sends the report to the trust and safety queue.'],
      ['Does BRANDSCOPE handle refunds or payments?', 'No. BRANDSCOPE is a discovery and networking platform, not a payment intermediary or escrow service. Refunds, delivery, warranties, and transaction disputes must be resolved directly with the listed brand.'],
      ['Can I install BRANDSCOPE on my phone or computer?', 'Yes. Use the Install button in the navigation. Supported browsers can add BRANDSCOPE to a phone Home Screen or install it as a desktop app.']
    ]
  }
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_GROUPS.flatMap((group) => group.questions.map(([question, answer]) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer }
  })))
};

export const FaqPage = () => (
  <main className="public-page faq-page">
    <Seo
      title="Frequently Asked Questions"
      description="Answers about joining BRANDSCOPE, publishing brand content, verification, Google discovery, support, safety, and installation."
      canonicalPath="/faq"
      schema={faqSchema}
    />

    <section className="public-hero public-hero--compact public-hero--faq">
      <div className="container public-hero-content public-hero-content--centered">
        <span className="public-hero-kicker"><CircleHelp size={14} /> Help centre</span>
        <h1>Questions, answered clearly.</h1>
        <p>Everything you need to know about business accounts, public discovery, verification, direct customer contact, and platform support.</p>
      </div>
    </section>

    <section className="public-section faq-content-section">
      <div className="container faq-layout">
        {FAQ_GROUPS.map((group, groupIndex) => {
          const Icon = group.icon;
          return (
            <section className="faq-group" key={group.title}>
              <div className="faq-group-heading">
                <span><Icon size={19} /></span>
                <div><small>Section {String(groupIndex + 1).padStart(2, '0')}</small><h2>{group.title}</h2></div>
              </div>
              <div className="faq-list">
                {group.questions.map(([question, answer], questionIndex) => (
                  <details key={question} open={groupIndex === 0 && questionIndex === 0}>
                    <summary><span>{question}</span><ChevronDown size={18} /></summary>
                    <p>{answer}</p>
                  </details>
                ))}
              </div>
            </section>
          );
        })}

        <div className="faq-contact-card">
          <span><MessageSquareText size={22} /></span>
          <div><small>Still need assistance?</small><h2>Send a message to the support inbox.</h2><p>Your inquiry will be saved privately for an authorized administrator to review.</p></div>
          <Link to="/contact" className="btn btn-primary">Contact support <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  </main>
);

export default FaqPage;
