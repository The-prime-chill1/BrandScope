import React from 'react';
import { Outlet, NavLink, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/navigation/Navbar';
import { 
  LayoutDashboard, 
  Building, 
  Package,
  FileText, 
  Users, 
  Bell, 
  BarChart3, 
  ShieldCheck,
  Settings,
  ExternalLink
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, currentBrand, loading, unreadNotifCount } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Loading your brand workspace...</p>
      </div>
    );
  }

  // Route protection
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
    { to: '/dashboard/profile', label: 'Brand Profile', icon: Building },
    { to: '/dashboard/products', label: 'Products & Showcase', icon: Package },
    { to: '/dashboard/posts', label: 'Posts & Updates', icon: FileText },
    { to: '/dashboard/followers', label: 'Followers', icon: Users },
    { to: '/dashboard/notifications', label: 'Notifications', icon: Bell, badge: unreadNotifCount },
    { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/dashboard/verification', label: 'Verification & Trust', icon: ShieldCheck },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          {currentBrand && (
            <div
              className="dashboard-brand-switcher"
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-5)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              {currentBrand.logoUrl ? (
                <img
                  src={currentBrand.logoUrl}
                  alt={currentBrand.name}
                  style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                />
              ) : (
                <span className="dashboard-brand-fallback">{currentBrand.name?.charAt(0)?.toUpperCase() || 'B'}</span>
              )}
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentBrand.name}
                </div>
                <Link
                  to={`/brand/${currentBrand.slug}`}
                  style={{ fontSize: '0.75rem', color: 'var(--color-blue)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  <span>View Public Page</span>
                  <ExternalLink size={10} />
                </Link>
              </div>
            </div>
          )}

          <nav className="dashboard-sidebar-nav" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span className="dashboard-nav-label" style={{ flex: 1 }}>{item.label}</span>
                  {item.badge > 0 && (
                    <span
                      style={{
                        backgroundColor: 'var(--color-error)',
                        color: '#fff',
                        fontSize: '0.7rem',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 700
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Workspace */}
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
