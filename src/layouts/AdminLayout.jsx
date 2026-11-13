import React, { useEffect, useState } from 'react';
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

const ADMIN_NAV = [
  { to: '/admin', label: 'Platform Overview', shortLabel: 'Overview', icon: ShieldCheck, exact: true },
  { to: '/admin/brands', label: 'Brand Registry', shortLabel: 'Brands', icon: Building2 },
  { to: '/admin/posts', label: 'Content Moderation', shortLabel: 'Content', icon: FileText },
  { to: '/admin/reports', label: 'Abuse Reports', shortLabel: 'Reports', icon: AlertTriangle },
  { to: '/admin/inquiries', label: 'Support Inbox', shortLabel: 'Support', icon: MessageSquareText },
  { to: '/admin/categories', label: 'Categories', shortLabel: 'Categories', icon: Tag },
  { to: '/admin/users', label: 'Accounts & Roles', shortLabel: 'Accounts', icon: Users },
  { to: '/admin/audit-logs', label: 'Security Audit Logs', shortLabel: 'Audit logs', icon: ScrollText },
  { to: '/admin/settings', label: 'Platform Controls', shortLabel: 'Controls', icon: Sliders }
];

export const AdminLayout = () => {
  useDataStoreVersion();
  const { user, isAdmin, loading, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setMobileNavOpen(false), [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
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

  const handleLogout = () => {
    navigate('/login?mode=admin', { replace: true });
    void logout();
  };

  return (
    <div className="admin-layout">
      <header className="admin-topbar">
        <div className="admin-topbar-leading">
          <button type="button" className="admin-menu-btn" onClick={() => setMobileNavOpen(true)} aria-label="Open platform navigation">
            <Menu size={21} />
          </button>
          <Link to="/admin" className="admin-topbar-brand" aria-label="BRANDSCOPE platform operations">
            <Logo size={31} showWordmark light />
            <span className="admin-product-name"><small>Platform</small><strong>Operations</strong></span>
          </Link>
        </div>

        <div className="admin-current-section"><ActiveIcon size={15} /><span>{activeItem.shortLabel}</span></div>

        <div className="admin-topbar-actions">
          <NotificationPermissionButton compact className="admin-device-alerts" />
          <span className="admin-user-email">{user.email}</span>
          <Link to="/dashboard" className="admin-topbar-action" title="Return to brand workspace"><ArrowLeft size={16} /><span>Workspace</span></Link>
          <button type="button" className="admin-topbar-action admin-logout-action" onClick={handleLogout}><LogOut size={16} /><span>Sign out</span></button>
        </div>
      </header>

      <div className="admin-shell">
        {mobileNavOpen && <button className="admin-mobile-overlay" type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
        <aside className={`admin-sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
          <div className="admin-sidebar-mobile-head">
            <div><span>BRANDSCOPE</span><strong>Platform Operations</strong></div>
            <button type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={20} /></button>
          </div>
          <span className="admin-nav-caption">Operations workspace</span>
          <nav className="admin-sidebar-nav" aria-label="Platform operations navigation">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} end={item.exact} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                  <span className="admin-nav-icon"><Icon size={18} /></span>
                  <span>{item.label}</span>
                  {item.to === '/admin/inquiries' && dataStore.supportInquiries.filter((inquiry) => inquiry.status === 'new').length > 0 && (
                    <span className="admin-nav-count">{dataStore.supportInquiries.filter((inquiry) => inquiry.status === 'new').length}</span>
                  )}
                  <ChevronRight size={14} className="admin-nav-chevron" />
                </NavLink>
              );
            })}
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
    </div>
  );
};

export default AdminLayout;
