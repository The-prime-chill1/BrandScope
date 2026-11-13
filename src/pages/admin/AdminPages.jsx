import React, { useMemo, useState } from 'react';
import { dataStore } from '../../services/dataStore';
import { useToast } from '../../contexts/ToastContext';
import { VerificationBadge, StatusBadge } from '../../components/common/Badge';
import {
  Activity,
  Building2,
  FileText,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  EyeOff,
  Tags,
  Users,
  ScrollText,
  Settings,
  Database,
  ExternalLink
} from 'lucide-react';

const ADMIN_EMAILS = [
  'chilltech2k26@gmail.com',
  'lamidiabdulhameedolawale@gmail.com',
  'lamidiabdulhameedolawale21@gmail.com'
];

const PanelHeader = ({ eyebrow, title, description, action }) => (
  <div className="admin-page-header">
    <div>
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    {action}
  </div>
);

const AdminEmpty = ({ icon: Icon, title, description }) => (
  <div className="admin-empty">
    <Icon size={30} />
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

export const AdminOverview = () => {
  const stats = dataStore.getAdminStats();
  const pendingReports = dataStore.reports.filter((report) => report.status === 'pending');
  const pendingVerifications = dataStore.verificationRequests.filter((request) => request.status === 'pending');

  const cards = [
    ['Brands', stats.totalBrands, Building2],
    ['Published posts', stats.totalPosts, FileText],
    ['Catalog items', stats.totalProducts, Tags],
    ['Verified brands', stats.verifiedBrands, ShieldCheck],
    ['Pending reports', stats.pendingReports, AlertTriangle],
    ['Verification queue', stats.pendingVerifications, CheckCircle2]
  ];

  return (
    <div>
      <PanelHeader eyebrow="Operations" title="Platform overview" description="Live directory health for a member-published business network." />
      <div className="admin-metric-grid">
        {cards.map(([label, value, Icon]) => (
          <article className="admin-metric" key={label}>
            <Icon size={18} />
            <strong>{Number(value || 0).toLocaleString()}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>

      <div className="admin-two-column">
        <section className="admin-panel">
          <div className="admin-panel-title"><ShieldCheck size={17} /><h2>Verification queue</h2></div>
          {pendingVerifications.length === 0 ? <AdminEmpty icon={CheckCircle2} title="Queue clear" description="New corporate submissions will appear here." /> : pendingVerifications.slice(0, 6).map((request) => {
            const brand = dataStore.getBrandById(request.brandId);
            return <div className="admin-list-row" key={request.id}><div><strong>{brand?.name || request.legalEntityName}</strong><span>{request.businessRegNumber}</span></div><a href="/admin/brands">Review</a></div>;
          })}
        </section>
        <section className="admin-panel">
          <div className="admin-panel-title"><AlertTriangle size={17} /><h2>Trust reports</h2></div>
          {pendingReports.length === 0 ? <AdminEmpty icon={CheckCircle2} title="No open reports" description="Member reports will appear here for moderation." /> : pendingReports.slice(0, 6).map((report) => <div className="admin-list-row" key={report.id}><div><strong>{report.reason}</strong><span>{report.targetType} · {new Date(report.createdAt).toLocaleDateString()}</span></div><a href="/admin/reports">Review</a></div>)}
        </section>
      </div>
    </div>
  );
};

export const AdminBrands = () => {
  const { addToast } = useToast();
  const [query, setQuery] = useState('');
  const [version, setVersion] = useState(0);
  const brands = useMemo(() => dataStore.brands.filter((brand) => [brand.name, brand.category, brand.country].some((value) => value?.toLowerCase().includes(query.toLowerCase()))), [query, version]);

  const setVerification = async (brand, status) => {
    try {
      await dataStore.setBrandVerification(brand.id, status);
      setVersion((value) => value + 1);
      addToast(`${brand.name} verification set to ${status}.`, 'success');
    } catch (error) { addToast(error.message, 'error'); }
  };

  const setStatus = async (brand, status) => {
    try {
      await dataStore.setBrandStatus(brand.id, status);
      setVersion((value) => value + 1);
      addToast(`${brand.name} is now ${status}.`, 'info');
    } catch (error) { addToast(error.message, 'error'); }
  };

  return (
    <div>
      <PanelHeader eyebrow="Directory" title="Brand registry" description="Review credentials, verification, and public listing status." />
      <div className="admin-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search brands..." /></div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Brand</th><th>Category</th><th>Verification</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{brands.map((brand) => (
            <tr key={brand.id}>
              <td><div className="admin-brand-cell">{brand.logoUrl ? <img src={brand.logoUrl} alt="" /> : <span>{brand.name.charAt(0)}</span>}<div><strong>{brand.name}</strong><small>{brand.city || brand.country}</small></div></div></td>
              <td>{brand.category}</td>
              <td>{brand.verificationStatus === 'verified' ? <VerificationBadge /> : <StatusBadge status={brand.verificationStatus} />}</td>
              <td><StatusBadge status={brand.status} /></td>
              <td><div className="admin-actions">
                {brand.verificationStatus !== 'verified' && <button onClick={() => setVerification(brand, 'verified')}><CheckCircle2 size={14} /> Verify</button>}
                {brand.verificationStatus === 'verified' && <button onClick={() => setVerification(brand, 'unverified')}><XCircle size={14} /> Revoke</button>}
                <button onClick={() => setStatus(brand, brand.status === 'active' ? 'suspended' : 'active')}>{brand.status === 'active' ? 'Suspend' : 'Activate'}</button>
                <a href={`/brand/${brand.slug}`} target="_blank" rel="noreferrer"><ExternalLink size={14} /></a>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
        {!brands.length && <AdminEmpty icon={Building2} title="No brands found" description="The registry will populate as businesses join." />}
      </div>
    </div>
  );
};

export const AdminPosts = () => {
  const { addToast } = useToast();
  const [posts, setPosts] = useState(dataStore.posts);
  const hidePost = async (post) => {
    if (!window.confirm('Hide this post from the public feed?')) return;
    try { await dataStore.hidePost(post.id); setPosts((items) => items.filter((item) => item.id !== post.id)); addToast('Post hidden.', 'info'); } catch (error) { addToast(error.message, 'error'); }
  };
  return <div><PanelHeader eyebrow="Content" title="Post moderation" description="Review member-published business updates and remove policy violations." />{posts.length ? <div className="admin-content-list">{posts.map((post) => <article key={post.id} className="admin-content-card"><div><strong>{post.brandName}</strong><small>{new Date(post.createdAt).toLocaleString()}</small><p>{post.text}</p></div><div className="admin-actions"><a href={`/post/${post.id}`} target="_blank" rel="noreferrer"><ExternalLink size={14} /> View</a><button onClick={() => hidePost(post)}><EyeOff size={14} /> Hide</button></div></article>)}</div> : <AdminEmpty icon={FileText} title="No posts yet" description="Posts published by brands will appear here." />}</div>;
};

export const AdminReports = () => {
  const { addToast } = useToast();
  const [reports, setReports] = useState(dataStore.reports);
  const resolve = async (id, status) => {
    try { await dataStore.resolveReport(id, status); setReports((items) => items.map((item) => item.id === id ? { ...item, status } : item)); addToast(`Report ${status}.`, 'success'); } catch (error) { addToast(error.message, 'error'); }
  };
  return <div><PanelHeader eyebrow="Trust & safety" title="Abuse reports" description="Investigate member reports and record a clear moderation outcome." />{reports.length ? <div className="admin-content-list">{reports.map((report) => <article className="admin-content-card" key={report.id}><div><strong>{report.reason}</strong><small>{report.targetType} · {new Date(report.createdAt).toLocaleString()}</small><p>{report.details || 'No additional details supplied.'}</p></div><div className="admin-actions"><StatusBadge status={report.status} />{report.status === 'pending' && <><button onClick={() => resolve(report.id, 'resolved')}><CheckCircle2 size={14} /> Resolve</button><button onClick={() => resolve(report.id, 'dismissed')}><XCircle size={14} /> Dismiss</button></>}</div></article>)}</div> : <AdminEmpty icon={AlertTriangle} title="No reports" description="The moderation queue is clear." />}</div>;
};

export const AdminCategories = () => <div><PanelHeader eyebrow="Taxonomy" title="Categories" description="The launch directory uses a focused, searchable business taxonomy." /><div className="admin-category-grid">{dataStore.categories.map((category) => <article key={category.id}><Tags size={17} /><div><strong>{category.name}</strong><span>{category.brandCount} brands</span></div></article>)}</div></div>;

export const AdminUsers = () => <div><PanelHeader eyebrow="Access control" title="Accounts & roles" description="Administrator access is restricted by the database allowlist." /><section className="admin-panel"><div className="admin-panel-title"><Users size={17} /><h2>Authorized administrators</h2></div>{ADMIN_EMAILS.map((email) => <div className="admin-list-row" key={email}><div><strong>{email}</strong><span>Supabase Auth invite/password account</span></div><StatusBadge status="admin" /></div>)}</section></div>;

export const AdminAuditLogs = () => <div><PanelHeader eyebrow="Security" title="Audit logs" description="Sensitive moderation and verification actions are recorded by database functions." />{dataStore.auditLogs.length ? <div className="admin-content-list">{dataStore.auditLogs.map((log) => <article className="admin-content-card" key={log.id}><div><strong>{log.action}</strong><small>{new Date(log.timestamp).toLocaleString()}</small><p>{log.targetType}{log.targetId ? ` · ${log.targetId}` : ''}</p></div></article>)}</div> : <AdminEmpty icon={ScrollText} title="No audit events yet" description="Administrative actions will appear after the platform begins operating." />}</div>;

export const AdminSettings = () => <div><PanelHeader eyebrow="Platform" title="System settings" description="BRANDSCOPE runs as a member-published directory with Supabase security controls." /><div className="admin-two-column"><section className="admin-panel"><div className="admin-panel-title"><Database size={17} /><h2>Data platform</h2></div><div className="admin-setting-row"><span>Authentication</span><strong>Supabase Auth</strong></div><div className="admin-setting-row"><span>Database security</span><strong>RLS enabled</strong></div><div className="admin-setting-row"><span>Media</span><strong>Supabase Storage</strong></div></section><section className="admin-panel"><div className="admin-panel-title"><Settings size={17} /><h2>Publishing model</h2></div><div className="admin-setting-row"><span>Member publishing</span><strong>Enabled</strong></div><div className="admin-setting-row"><span>Editorial verification</span><strong>Enabled</strong></div><div className="admin-setting-row"><span>Direct brand contact</span><strong>Enabled</strong></div></section></div></div>;

export default AdminOverview;
