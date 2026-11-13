import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { Seo } from '../../components/common/Seo';

export const NotFoundPage = () => (
  <main className="public-not-found">
    <Seo
      title="Page Not Found"
      description="The requested BRANDSCOPE page could not be found."
      canonicalPath="/404"
      noIndex
    />
    <div className="public-not-found-icon"><Compass size={27} /></div>
    <span className="section-eyebrow">404 directory notice</span>
    <h1>This page is outside the scope.</h1>
    <p>The link may be outdated, or the page may have moved. Return home to continue discovering brands.</p>
    <Link to="/" className="btn btn-primary"><ArrowLeft size={16} /> Return to homepage</Link>
  </main>
);

export default NotFoundPage;
