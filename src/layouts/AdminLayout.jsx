import React from 'react';
import { Outlet, NavLink, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/common/Logo';
import { 
  ShieldAlert, 
  Building2, 
  FileText, 
  Users, 
  AlertTriangle, 
  Tag, 
  ScrollText, 
  Sliders, 
  ArrowLeft 
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading administration...</div>;
  }

  // Security barrier: non-admins cannot access admin workspace
  if (!user || !isAdmin) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <ShieldAlert size={48} color="#DC2626" style={{ margin: '0 auto 16px auto' }} />
        <h2>Access Restricted</h2>
        <p style={{ marginTop: '8px', marginBottom: '24px' }}>
          This area is restricted to authorized BRANDSCOPE platform administrators and security engineers.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-outline">Return to Homepage</Link>
          <Link to="/login" className="btn btn-primary">Sign In as Admin</Link>
        </div>
      </div>
    );
  }

  const adminNav = [
    { to: '/admin', label: 'Platform Overview', icon: ShieldAlert, exact: true },
    { to: '/admin/brands', label: 'Brand Registry', icon: Building2 },
    { to: '/admin/posts', label: 'Content Moderation', icon: FileText },
    { to: '/admin/reports', label: 'Abuse Reports', icon: AlertTriangle },
    { to: '/admin/categories', label: 'Categories', icon: Tag },
    { to: '/admin/users', label: 'Accounts & Roles', icon: Users },
    { to: '/admin/audit-logs', label: 'Security Audit Logs', icon: ScrollText },
    { to: '/admin/settings', label: 'Platform Controls', icon: Sliders }
  ];

  return (
    <div className="admin-layout">
      {/* Admin Top Header */}
      <header className="admin-topbar">
        <div className="admin-topbar-brand">
          <Logo size={32} showWordmark={true} light={true} />
          <span
            style={{
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px',
              letterSpacing: '0.08em'
            }}
          >
            ADMIN CONSOLE
          </span>
        </div>

        <div className="admin-topbar-user">
          <span>{user.email}</span>
          <Link
            to="/dashboard"
            className="btn btn-outline btn-sm"
            style={{ color: '#F8FAFC', borderColor: '#334155', gap: '6px' }}
          >
            <ArrowLeft size={14} />
            <span>Return to Workspace</span>
          </Link>
        </div>
      </header>

      {/* Admin Body */}
      <div className="admin-shell">
        <aside className="admin-sidebar">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </aside>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
