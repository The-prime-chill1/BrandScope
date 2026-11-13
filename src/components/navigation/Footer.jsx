import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { ExternalLink, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div>
            <Logo size={36} showWordmark={true} light={true} />
            <p style={{ color: '#94A3B8', marginTop: 'var(--space-4)', maxWidth: '320px', fontSize: '0.9rem' }}>
              The global social platform designed exclusively for verified businesses, independent brands, startups, and commercial creators.
            </p>
            <div style={{ marginTop: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: '8px', color: '#CBD5E1', fontSize: '0.85rem' }}>
              <ShieldCheck size={16} color="#38BDF8" />
              <span>Strict Business-Only Identity Verification</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="footer-col">
            <h4>Discovery</h4>
            <ul className="footer-links">
              <li><Link to="/discover" className="footer-link">Discover Brands</Link></li>
              <li><Link to="/categories" className="footer-link">Browse Categories</Link></li>
              <li><Link to="/feed" className="footer-link">Public Feed</Link></li>
              <li><Link to="/signup" className="footer-link">Join the Directory</Link></li>
            </ul>
          </div>

          {/* For Businesses */}
          <div className="footer-col">
            <h4>For Businesses</h4>
            <ul className="footer-links">
              <li><Link to="/signup" className="footer-link">List Your Brand</Link></li>
              <li><Link to="/login" className="footer-link">Brand Owner Login</Link></li>
              <li><Link to="/dashboard/products" className="footer-link">Manage Products</Link></li>
              <li><Link to="/dashboard/posts" className="footer-link">Publish Updates</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4>Company</h4>
            <ul className="footer-links">
              <li><Link to="/about" className="footer-link">About BRANDSCOPE</Link></li>
              <li><Link to="/contact" className="footer-link">Contact & Support</Link></li>
              <li><Link to="/guidelines" className="footer-link">Community Guidelines</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-col">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
              <li><Link to="/terms" className="footer-link">Terms of Service</Link></li>
              <li><a href="https://chilltechltd.com" target="_blank" rel="noopener noreferrer" className="footer-link">Tech Partner <ExternalLink size={12} style={{ display: 'inline' }} /></a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar with CHILL TECH LTD attribution */}
        <div className="footer-bottom">
          <div>
            &copy; {currentYear} BRANDSCOPE. All rights reserved. Where Brands Get Discovered.
          </div>

          {/* Technology partner attribution */}
          <div className="footer-attribution">
            <span>Built and powered by</span>
            <a
              href="https://chilltechltd.com"
              target="_blank"
              rel="noopener noreferrer"
              title="CHILL TECH LTD — Enterprise Software & Cloud Infrastructure"
            >
              CHILL TECH LTD
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
