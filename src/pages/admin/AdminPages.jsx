import React, { useEffect, useMemo, useState } from 'react';
import { dataStore } from '../../services/dataStore';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { VerificationBadge, StatusBadge } from '../../components/common/Badge';
import { SelectField } from '../../components/common/SelectField';
import { ADMIN_EMAILS } from '../../config/admins';
import { useDataStoreVersion } from '../../hooks/useDataStoreVersion';
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
  ExternalLink,
  MessageSquareText,
  Mail,
  Clock3,
  RotateCcw
} from 'lucide-react';

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

const VerificationQueue = ({ compact = false, onReviewed }) => {
  const { addToast } = useToast();
  const [requests, setRequests] = useState(() => dataStore.verificationRequests.filter((request) => request.status === 'pending'));
  const [busyId, setBusyId] = useState('');

  useEffect(() => dataStore.subscribe(() => {
    setRequests(dataStore.verificationRequests.filter((request) => request.status === 'pending'));
  }), []);

  const review = async (request, decision) => {
    const notes = decision === 'rejected'
      ? window.prompt('Add a short reason for rejecting this verification request:', '')
      : '';
    if (notes === null) return;
    if (decision === 'approved' && !window.confirm(`Approve ${request.legalEntityName} for the verified badge?`)) return;

    setBusyId(request.id);
    try {
      await dataStore.reviewVerificationRequest(request.id, decision, notes);
      setRequests((items) => items.filter((item) => item.id !== request.id));
      onReviewed?.();
      addToast(`Verification request ${decision}.`, 'success');
    } catch (error) {
      addToast(error.message || 'Could not review this verification request.', 'error');
    } finally {
      setBusyId('');
    }
  };

  const openDocument = async (request) => {
    try {
      const signedUrl = await dataStore.getVerificationDocumentUrl(request.documentPath);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      addToast(error.message || 'Could not open the verification document.', 'error');
    }
  };

  const visibleRequests = compact ? requests.slice(0, 4) : requests;

  return (
    <section className="admin-panel admin-verification-queue">
      <div className="admin-panel-title">
        <ShieldCheck size={17} />
        <h2>Verification requests</h2>
        <span className="admin-panel-count">{requests.length} pending</span>
      </div>
      {visibleRequests.length === 0 ? (
        <AdminEmpty icon={CheckCircle2} title="Verification queue clear" description="New badge requests will appear here immediately after submission." />
      ) : (
        <div className="admin-verification-list">
          {visibleRequests.map((request) => {
            const brand = dataStore.getBrandById(request.brandId);
            return (
              <article className="admin-verification-card" key={request.id}>
                <div className="admin-verification-card-head">
                  <div>
                    <span>Badge request</span>
                    <h3>{brand?.name || request.legalEntityName}</h3>
                    <p>{request.legalEntityName} · {request.businessRegNumber}</p>
                  </div>
                  <StatusBadge status="pending" />
                </div>
                <div className="admin-verification-facts">
                  <div><small>Submitted</small><strong>{new Date(request.createdAt).toLocaleString()}</strong></div>
                  {request.directorName && <div><small>Representative</small><strong>{request.directorName}</strong></div>}
                  {request.websiteDomain && <div><small>Website</small><a href={request.websiteDomain} target="_blank" rel="noreferrer">Open website <ExternalLink size={12} /></a></div>}
                  {request.registeredAddress && <div><small>Registered address</small><strong>{request.registeredAddress}</strong></div>}
                </div>
                <div className="admin-verification-actions">
                  {request.documentPath && <button type="button" onClick={() => openDocument(request)}><FileText size={14} /> View document</button>}
                  <button type="button" className="is-approve" disabled={busyId === request.id} onClick={() => review(request, 'approved')}><CheckCircle2 size={14} /> Approve badge</button>
                  <button type="button" className="is-reject" disabled={busyId === request.id} onClick={() => review(request, 'rejected')}><XCircle size={14} /> Reject</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {compact && requests.length > visibleRequests.length && <a className="admin-queue-more" href="/admin/brands">Review all {requests.length} requests</a>}
    </section>
  );
};

export const AdminOverview = () => {
  useDataStoreVersion();
  const stats = dataStore.getAdminStats();
  const pendingReports = dataStore.reports.filter((report) => report.status === 'pending');
  const openInquiries = dataStore.supportInquiries.filter((inquiry) => ['new', 'in_progress'].includes(inquiry.status));

  const cards = [
    ['Brands', stats.totalBrands, Building2],
    ['Published posts', stats.totalPosts, FileText],
    ['Catalog items', stats.totalProducts, Tags],
    ['Verified brands', stats.verifiedBrands, ShieldCheck],
    ['Pending reports', stats.pendingReports, AlertTriangle],
    ['Verification queue', stats.pendingVerifications, CheckCircle2],
    ['Open support inquiries', stats.openSupportInquiries, MessageSquareText]
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

      <section className="admin-panel admin-support-preview">
        <div className="admin-panel-title"><MessageSquareText size={17} /><h2>Support inbox</h2><a href="/admin/inquiries">Open inbox</a></div>
        {openInquiries.length === 0 ? (
          <AdminEmpty icon={CheckCircle2} title="Inbox clear" description="New contact and support inquiries will appear here." />
        ) : openInquiries.slice(0, 5).map((inquiry) => (
          <div className="admin-list-row" key={inquiry.id}>
            <div><strong>{inquiry.subject}</strong><span>{inquiry.name} · {new Date(inquiry.createdAt).toLocaleString()}</span></div>
            <a href="/admin/inquiries">Review</a>
          </div>
        ))}
      </section>

      <div className="admin-two-column">
        <VerificationQueue compact />
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
  const storeVersion = useDataStoreVersion();
  const [query, setQuery] = useState('');
  const [version, setVersion] = useState(0);
  const brands = useMemo(() => dataStore.brands.filter((brand) => [brand.name, brand.category, brand.country].some((value) => value?.toLowerCase().includes(query.toLowerCase()))), [query, version, storeVersion]);

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
      <VerificationQueue onReviewed={() => setVersion((value) => value + 1)} />
      <div className="admin-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search brands..." /></div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Brand</th><th>Category</th><th>Verification</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{brands.map((brand) => (
            <tr key={brand.id}>
              <td data-label="Brand"><div className="admin-brand-cell">{brand.logoUrl ? <img src={brand.logoUrl} alt="" /> : <span>{brand.name.charAt(0)}</span>}<div><strong>{brand.name}</strong><small>{brand.city || brand.country}</small></div></div></td>
              <td data-label="Category">{brand.category}</td>
              <td data-label="Verification">{brand.verificationStatus === 'verified' ? <VerificationBadge /> : <StatusBadge status={brand.verificationStatus} />}</td>
              <td data-label="Status"><StatusBadge status={brand.status} /></td>
              <td data-label="Actions"><div className="admin-actions">
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
  useDataStoreVersion();
  const posts = dataStore.posts;
  const hidePost = async (post) => {
    if (!window.confirm('Hide this post from the public feed?')) return;
    try { await dataStore.hidePost(post.id); addToast('Post hidden.', 'info'); } catch (error) { addToast(error.message, 'error'); }
  };
  return <div><PanelHeader eyebrow="Content" title="Post moderation" description="Review member-published business updates and remove policy violations." />{posts.length ? <div className="admin-content-list">{posts.map((post) => <article key={post.id} className="admin-content-card"><div><strong>{post.brandName}</strong><small>{new Date(post.createdAt).toLocaleString()}</small><p>{post.text}</p></div><div className="admin-actions"><a href={`/post/${post.id}`} target="_blank" rel="noreferrer"><ExternalLink size={14} /> View</a><button onClick={() => hidePost(post)}><EyeOff size={14} /> Hide</button></div></article>)}</div> : <AdminEmpty icon={FileText} title="No posts yet" description="Posts published by brands will appear here." />}</div>;
};

export const AdminReports = () => {
  const { addToast } = useToast();
  useDataStoreVersion();
  const reports = dataStore.reports;
  const resolve = async (id, status) => {
    try { await dataStore.resolveReport(id, status); addToast(`Report ${status}.`, 'success'); } catch (error) { addToast(error.message, 'error'); }
  };
  return <div><PanelHeader eyebrow="Trust & safety" title="Abuse reports" description="Investigate member reports and record a clear moderation outcome." />{reports.length ? <div className="admin-content-list">{reports.map((report) => <article className="admin-content-card" key={report.id}><div><strong>{report.reason}</strong><small>{report.targetType} · {new Date(report.createdAt).toLocaleString()}</small><p>{report.details || 'No additional details supplied.'}</p></div><div className="admin-actions"><StatusBadge status={report.status} />{report.status === 'pending' && <><button onClick={() => resolve(report.id, 'resolved')}><CheckCircle2 size={14} /> Resolve</button><button onClick={() => resolve(report.id, 'dismissed')}><XCircle size={14} /> Dismiss</button></>}</div></article>)}</div> : <AdminEmpty icon={AlertTriangle} title="No reports" description="The moderation queue is clear." />}</div>;
};

export const AdminInquiries = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');
  const [notes, setNotes] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => dataStore.subscribe(() => setVersion((value) => value + 1)), []);

  const inquiries = useMemo(() => dataStore.supportInquiries.filter((inquiry) => {
    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'open' && ['new', 'in_progress'].includes(inquiry.status))
      || inquiry.status === statusFilter;
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = !normalizedQuery || [inquiry.name, inquiry.email, inquiry.subject, inquiry.message, inquiry.inquiryType]
      .some((value) => value?.toLowerCase().includes(normalizedQuery));
    return matchesStatus && matchesQuery;
  }), [query, statusFilter, version]);

  const updateInquiry = async (inquiry, updates, successMessage) => {
    setSavingId(inquiry.id);
    try {
      await dataStore.updateSupportInquiry(inquiry.id, updates, user.uid);
      setVersion((value) => value + 1);
      addToast(successMessage, 'success');
    } catch (error) {
      addToast(error.message || 'The support inquiry could not be updated.', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const saveNote = (inquiry) => updateInquiry(
    inquiry,
    { adminNote: notes[inquiry.id] ?? inquiry.adminNote },
    'Internal support note saved.'
  );

  return (
    <div>
      <PanelHeader
        eyebrow="Customer support"
        title="Support inbox"
        description="Contact form messages are stored privately here for authorized administrators."
        action={<span className="admin-header-count"><MessageSquareText size={15} /> {dataStore.getAdminStats().openSupportInquiries} open</span>}
      />

      <div className="admin-inquiry-toolbar">
        <div className="admin-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, subject, or message..." /></div>
        <div className="admin-inquiry-filter">
          <SelectField
            value={statusFilter}
            ariaLabel="Filter support inquiries"
            options={[
              { value: 'open', label: 'Open inquiries' },
              { value: 'new', label: 'New only' },
              { value: 'in_progress', label: 'In progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
              { value: 'all', label: 'All inquiries' }
            ]}
            onChange={setStatusFilter}
          />
        </div>
      </div>

      {inquiries.length ? (
        <div className="admin-inquiry-list">
          {inquiries.map((inquiry) => (
            <article className={`admin-inquiry-card admin-inquiry-card--${inquiry.status}`} key={inquiry.id}>
              <div className="admin-inquiry-head">
                <div>
                  <div className="admin-inquiry-meta"><StatusBadge status={inquiry.status} /><span>{inquiry.inquiryType.replace('_', ' ')}</span></div>
                  <h2>{inquiry.subject}</h2>
                  <span><Clock3 size={13} /> {new Date(inquiry.createdAt).toLocaleString()}</span>
                </div>
                <a className="admin-inquiry-email" href={`mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: ${inquiry.subject}`)}`}><Mail size={15} /> Reply by email</a>
              </div>

              <div className="admin-inquiry-sender">
                <span>{inquiry.name.charAt(0).toUpperCase()}</span>
                <div><strong>{inquiry.name}</strong><a href={`mailto:${inquiry.email}`}>{inquiry.email}</a></div>
              </div>

              <p className="admin-inquiry-message">{inquiry.message}</p>

              <div className="admin-inquiry-note">
                <label htmlFor={`support-note-${inquiry.id}`}>Private administrator note</label>
                <textarea
                  id={`support-note-${inquiry.id}`}
                  rows={3}
                  value={notes[inquiry.id] ?? inquiry.adminNote}
                  onChange={(event) => setNotes((current) => ({ ...current, [inquiry.id]: event.target.value }))}
                  placeholder="Record follow-up details visible only to administrators..."
                />
                <button type="button" disabled={savingId === inquiry.id} onClick={() => saveNote(inquiry)}>Save note</button>
              </div>

              <div className="admin-inquiry-actions">
                {inquiry.status === 'new' && <button type="button" disabled={savingId === inquiry.id} onClick={() => updateInquiry(inquiry, { status: 'in_progress' }, 'Inquiry marked in progress.')}><Clock3 size={14} /> Start review</button>}
                {inquiry.status === 'in_progress' && <button type="button" disabled={savingId === inquiry.id} onClick={() => updateInquiry(inquiry, { status: 'resolved' }, 'Inquiry resolved.')}><CheckCircle2 size={14} /> Mark resolved</button>}
                {['resolved', 'closed'].includes(inquiry.status) && <button type="button" disabled={savingId === inquiry.id} onClick={() => updateInquiry(inquiry, { status: 'new' }, 'Inquiry reopened.')}><RotateCcw size={14} /> Reopen</button>}
                {!['closed'].includes(inquiry.status) && <button type="button" disabled={savingId === inquiry.id} onClick={() => updateInquiry(inquiry, { status: 'closed' }, 'Inquiry closed.')}><XCircle size={14} /> Close</button>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <AdminEmpty icon={MessageSquareText} title="No inquiries found" description="Try another filter, or wait for a visitor to contact support." />
      )}
    </div>
  );
};

export const AdminCategories = () => {
  useDataStoreVersion();
  return <div><PanelHeader eyebrow="Taxonomy" title="Categories" description="The launch directory uses a focused, searchable business taxonomy." /><div className="admin-category-grid">{dataStore.categories.map((category) => <article key={category.id}><Tags size={17} /><div><strong>{category.name}</strong><span>{category.brandCount} brands</span></div></article>)}</div></div>;
};

export const AdminUsers = () => <div><PanelHeader eyebrow="Access control" title="Accounts & roles" description="Administrator access is restricted by the database allowlist." /><section className="admin-panel"><div className="admin-panel-title"><Users size={17} /><h2>Authorized administrators</h2></div>{ADMIN_EMAILS.map((email) => <div className="admin-list-row" key={email}><div><strong>{email}</strong><span>Supabase Auth invite/password account</span></div><StatusBadge status="admin" /></div>)}</section></div>;

export const AdminAuditLogs = () => {
  useDataStoreVersion();
  return <div><PanelHeader eyebrow="Security" title="Audit logs" description="Sensitive moderation and verification actions are recorded by database functions." />{dataStore.auditLogs.length ? <div className="admin-content-list">{dataStore.auditLogs.map((log) => <article className="admin-content-card" key={log.id}><div><strong>{log.action}</strong><small>{new Date(log.timestamp).toLocaleString()}</small><p>{log.targetType}{log.targetId ? ` · ${log.targetId}` : ''}</p></div></article>)}</div> : <AdminEmpty icon={ScrollText} title="No audit events yet" description="Administrative actions will appear after the platform begins operating." />}</div>;
};

export const AdminSettings = () => <div><PanelHeader eyebrow="Platform" title="System settings" description="BRANDSCOPE runs as a member-published directory with Supabase security controls." /><div className="admin-two-column"><section className="admin-panel"><div className="admin-panel-title"><Database size={17} /><h2>Data platform</h2></div><div className="admin-setting-row"><span>Authentication</span><strong>Supabase Auth</strong></div><div className="admin-setting-row"><span>Database security</span><strong>RLS enabled</strong></div><div className="admin-setting-row"><span>Media</span><strong>Supabase Storage</strong></div></section><section className="admin-panel"><div className="admin-panel-title"><Settings size={17} /><h2>Publishing model</h2></div><div className="admin-setting-row"><span>Member publishing</span><strong>Enabled</strong></div><div className="admin-setting-row"><span>Editorial verification</span><strong>Enabled</strong></div><div className="admin-setting-row"><span>Direct brand contact</span><strong>Enabled</strong></div></section></div></div>;

export default AdminOverview;
