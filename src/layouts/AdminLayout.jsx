import React, { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/common/Logo';
import { dataStore } from '../services/dataStore';
import { NotificationPermissionButton } from '../components/common/NotificationPermissionButton';
import { useDataStoreVersion } from '../hooks/useDataStoreVersion';
import {
  ShieldCheck,
  Building2,
  FileText,
  Users,
  AlertTriangle,
  Tag,
  ScrollText,
  Sliders,
  ArrowLeft,
  Menu,
  X,
  LogOut,
  Home,
  ChevronRight,
  MessageSquareText
} from 'lucide-react';

const ADMIN_NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { to: '/admin', label: 'Platform Overview', shortLabel: 'Overview', description: 'Health and activity', icon: ShieldCheck, exact: true }
    ]
  },
  {
    label: 'Directory & content',
    items: [
      { to: '/admin/brands', label: 'Brand Registry', shortLabel: 'Brands', description: 'Profiles and verification', icon: Building2, badge: 'verifications' },
      { to: '/admin/posts', label: 'Content Moderation', shortLabel: 'Content', description: 'Published brand updates', icon: FileText },
      { to: '/admin/categories', label: 'Categories', shortLabel: 'Categories', description: 'Directory taxonomy', icon: Tag }
    ]
  },
  {
    label: 'Trust & support',
    items: [
      { to: '/admin/reports', label: 'Abuse Reports', shortLabel: 'Reports', description: 'Trust and safety cases', icon: AlertTriangle, badge: 'reports' },
      { to: '/admin/inquiries', label: 'Support Inbox', shortLabel: 'Support', description: 'Customer enquiries', icon: MessageSquareText, badge: 'support' }
    ]
  },
  {
    label: 'Governance',
    items: [
      { to: '/admin/users', label: 'Accounts & Roles', shortLabel: 'Accounts', description: 'Administrator access', icon: Users },
      { to: '/admin/audit-logs', label: 'Security Audit Logs', shortLabel: 'Audit logs', description: 'Protected activity', icon: ScrollText },
      { to: '/admin/settings', label: 'Platform Controls', shortLabel: 'Controls', description: 'System configuration', icon: Sliders }
    ]
  }
];

const ADMIN_NAV = ADMIN_NAV_GROUPS.flatMap((group) => group.items);

export const AdminLayout = () => {
  useDataStoreVersion();
  const { user, isAdmin, loading, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setMobileNavOpen(false), [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      menuButtonRef.current?.focus();
    };
  }, [mobileNavOpen]);

  if (loading) {
    return <div className="workspace-loading"><span className="workspace-loading-mark" />Preparing platform operations...</div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="admin-access-page">
        <div className="admin-access-panel">
          <div className="admin-access-icon"><ShieldCheck size={30} /></div>
          <span className="admin-access-kicker">Protected workspace</span>
          <h1>Platform operations access</h1>
          <p>Sign in with an authorized administrator account to review brands, trust reports, verification requests, and security activity.</p>
          <div className="admin-access-actions">
            <Link to="/login?mode=admin" className="btn btn-primary">Administrator sign in</Link>
            <Link to="/" className="btn btn-outline"><Home size={16} /> Return home</Link>
          </div>
          <span className="admin-access-note">Access is enforced by Supabase account roles and database policies.</span>
        </div>
      </div>
    );
  }

  const activeItem = ADMIN_NAV.find((item) => item.exact
    ? location.pathname === item.to
    : location.pathname.startsWith(item.to)) || ADMIN_NAV[0];
  const ActiveIcon = activeItem.icon;
  const pendingCounts = {
    support: dataStore.supportInquiries.filter((inquiry) => inquiry.status === 'new').length,
    reports: dataStore.reports.filter((report) => report.status === 'pending').length,
    verifications: dataStore.verificationRequests.filter((request) => request.status === 'pending').length
  };

  const getBadgeCount = (item) => item.badge ? pendingCounts[item.badge] : 0;

  const handleLogout = () => {
    navigate('/login?mode=admin', { replace: true });
    void logout();
  };

  return (
    <div className="admin-layout">
      <header className="admin-topbar">
        <div className="admin-topbar-leading">
          <button
            ref={menuButtonRef}
            type="button"
            className="admin-menu-btn"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open platform navigation"
            aria-controls="admin-navigation-drawer"
            aria-expanded={mobileNavOpen}
          >
            <Menu size={21} />
          </button>
          <Link to="/admin" className="admin-topbar-brand" aria-label="BRANDSCOPE platform operations">
            <Logo size={31} showWordmark light />
            <span className="admin-product-name"><small>Platform</small><strong>Operations</strong></span>
          </Link>
        </div>

        <div className="admin-current-section">
          <span className="admin-current-icon"><ActiveIcon size={16} /></span>
          <span className="admin-current-copy"><small>Admin workspace</small><strong>{activeItem.shortLabel}</strong></span>
        </div>

        <div className="admin-topbar-actions">
          <NotificationPermissionButton compact className="admin-device-alerts" />
          <span className="admin-user-email">{user.email}</span>
          <Link to="/dashboard" className="admin-topbar-action" title="Return to brand workspace"><ArrowLeft size={16} /><span>Workspace</span></Link>
          <button type="button" className="admin-topbar-action admin-logout-action" onClick={handleLogout}><LogOut size={16} /><span>Sign out</span></button>
        </div>
      </header>

      <div className="admin-shell">
        {mobileNavOpen && <button className="admin-mobile-overlay" type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
        <aside id="admin-navigation-drawer" className={`admin-sidebar ${mobileNavOpen ? 'is-open' : ''}`} aria-label="Platform operations navigation">
          <div className="admin-sidebar-mobile-head">
            <div className="admin-drawer-brand">
              <Logo size={34} showWordmark light />
              <span><small>Administrator</small><strong>Control centre</strong></span>
            </div>
            <button ref={closeButtonRef} type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={20} /></button>
          </div>
          <div className="admin-drawer-current">
            <span><ActiveIcon size={17} /></span>
            <div><small>Current section</small><strong>{activeItem.label}</strong></div>
          </div>
          <nav className="admin-sidebar-nav">
            {ADMIN_NAV_GROUPS.map((group) => (
              <div className="admin-nav-group" key={group.label}>
                <span className="admin-nav-group-label">{group.label}</span>
                <div className="admin-nav-group-links">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const badgeCount = getBadgeCount(item);
                    return (
                      <NavLink key={item.to} to={item.to} end={item.exact} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                        <span className="admin-nav-icon"><Icon size={18} /></span>
                        <span className="admin-nav-copy"><strong>{item.label}</strong><small>{item.description}</small></span>
                        {badgeCount > 0 && <span className="admin-nav-count">{badgeCount > 99 ? '99+' : badgeCount}</span>}
                        <ChevronRight size={14} className="admin-nav-chevron" />
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <div className="admin-user-card">
              <span className="admin-user-avatar">{user.email?.charAt(0)?.toUpperCase()}</span>
              <div><strong>Administrator</strong><small>{user.email}</small></div>
            </div>
            <div className="admin-sidebar-footer-actions">
              <Link to="/" title="Open public website"><Home size={17} /><span>Public site</span></Link>
              <button type="button" onClick={handleLogout}><LogOut size={17} /><span>Sign out</span></button>
            </div>
          </div>
        </aside>

        <main className="admin-main"><Outlet /></main>
      </div>

      <nav className="admin-mobile-tabs" aria-label="Quick platform navigation">
        <NavLink to="/admin" end><ShieldCheck size={19} /><span>Overview</span></NavLink>
        <NavLink to="/admin/brands"><Building2 size={19} /><span>Brands</span>{pendingCounts.verifications > 0 && <b>{pendingCounts.verifications > 9 ? '9+' : pendingCounts.verifications}</b>}</NavLink>
        <NavLink to="/admin/inquiries"><MessageSquareText size={19} /><span>Support</span>{pendingCounts.support > 0 && <b>{pendingCounts.support > 9 ? '9+' : pendingCounts.support}</b>}</NavLink>
        <button type="button" className={mobileNavOpen || !['/admin', '/admin/brands', '/admin/inquiries'].includes(location.pathname) ? 'active' : ''} onClick={() => setMobileNavOpen(true)} aria-label="Open all admin sections"><Menu size={19} /><span>More</span></button>
      </nav>
    </div>
  );
};

export default AdminLayout;
