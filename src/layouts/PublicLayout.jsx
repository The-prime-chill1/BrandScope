import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import { Seo } from '../components/common/Seo';

const PAGE_SEO = {
  '/': {
    title: 'BRANDSCOPE — Where Brands Get Discovered',
    description: 'Discover authentic businesses, products, services, and brand updates. BRANDSCOPE is the global commercial discovery network built and powered by CHILL TECH LTD.'
  },
  '/discover': {
    title: 'Discover Brands',
    description: 'Search authentic businesses by industry, location, and catalog availability on BRANDSCOPE.'
  },
  '/search': {
    title: 'Search Brands',
    description: 'Search the BRANDSCOPE business directory by brand name, product, industry, and location.'
  },
  '/categories': {
    title: 'Business Categories',
    description: 'Explore businesses across technology, fashion, food, professional services, retail, logistics, and more.'
  },
  '/feed': {
    title: 'Brand Updates',
    description: 'Read announcements, launches, stories, and commercial updates published directly by brands on BRANDSCOPE.'
  },
  '/about': {
    title: 'About BRANDSCOPE',
    description: 'Learn how BRANDSCOPE helps legitimate businesses get discovered and connect directly with customers and commercial partners.'
  },
  '/contact': {
    title: 'Contact BRANDSCOPE',
    description: 'Contact the BRANDSCOPE team for platform support, verification assistance, and commercial partnerships.'
  },
  '/privacy': {
    title: 'Privacy Policy',
    description: 'Read the BRANDSCOPE privacy policy and learn how business, account, and public listing data is handled.'
  },
  '/terms': {
    title: 'Terms of Service',
    description: 'Read the terms governing business accounts, public listings, direct brand transactions, and use of BRANDSCOPE.'
  },
  '/guidelines': {
    title: 'Community & Trust Guidelines',
    description: 'Review the authenticity, publishing, impersonation, and trust standards for businesses on BRANDSCOPE.'
  }
};

const AUTH_PATHS = new Set(['/login', '/signup', '/forgot-password', '/verify-email', '/set-password', '/auth/confirm']);

export const PublicLayout = () => {
  const { pathname } = useLocation();
  const pageSeo = PAGE_SEO[pathname];
  const authPage = AUTH_PATHS.has(pathname);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {pageSeo && <Seo {...pageSeo} canonicalPath={pathname} />}
      {authPage && (
        <Seo
          title="Secure Brand Account"
          description="Access or create a BRANDSCOPE business account."
          canonicalPath={pathname}
          noIndex
        />
      )}
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
