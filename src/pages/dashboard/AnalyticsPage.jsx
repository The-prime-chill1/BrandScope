import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../services/dataStore';
import { Users, FileText, Heart, MessageSquare, Package, BarChart3 } from 'lucide-react';

export const AnalyticsPage = () => {
  const { currentBrand } = useAuth();
  if (!currentBrand) return null;

  const posts = dataStore.getPosts({ brandId: currentBrand.id, limit: 250 });
  const totalLikes = posts.reduce((sum, post) => sum + (post.likeCount || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.commentCount || 0), 0);
  const metrics = [
    { label: 'Followers', value: currentBrand.followerCount || 0, icon: Users, tone: 'blue' },
    { label: 'Published posts', value: posts.length, icon: FileText, tone: 'cyan' },
    { label: 'Post likes', value: totalLikes, icon: Heart, tone: 'rose' },
    { label: 'Comments', value: totalComments, icon: MessageSquare, tone: 'green' },
    { label: 'Catalog items', value: currentBrand.products?.length || 0, icon: Package, tone: 'violet' }
  ];

  return (
    <div className="dashboard-page-narrow">
      <div className="dashboard-page-heading">
        <span className="section-eyebrow"><BarChart3 size={14} /> Live account metrics</span>
        <h1>Brand analytics</h1>
        <p>Only verified interactions stored by BRANDSCOPE are shown here. No estimated or fabricated traffic figures.</p>
      </div>

      <div className="metric-grid">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className={`metric-card metric-card--${tone}`}>
            <div className="metric-card-icon"><Icon size={19} /></div>
            <span>{label}</span>
            <strong>{Number(value).toLocaleString()}</strong>
          </article>
        ))}
      </div>

      <section className="card analytics-note">
        <div>
          <h3>More insight as your audience grows</h3>
          <p>Post-level engagement is recorded immediately. Profile impressions and outbound click analytics can be added after the public launch has enough real traffic to measure responsibly.</p>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsPage;
