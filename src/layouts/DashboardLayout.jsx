import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
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
  ExternalLink,
  Menu,
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, currentBrand, loading, brandLoading, unreadNotifCount, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setMobileNavOpen(false), [location.pathname]);

  if (loading) return <div className="workspace-loading"><span className="workspace-loading-mark" />Loading your brand workspace...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
    { to: '/dashboard/profile', label: 'Brand Profile', icon: Building },
    { to: '/dashboard/products', label: 'Products & Showcase', icon: Package },
    { to: '/dashboard/posts', label: 'Posts & Updates', icon: FileText },
    { to: '/dashboard/followers', label: 'Followers', icon: Users },
    { to: '/dashboard/notifications', label: 'Notifications', icon: Bell, badge: unreadNotifCount },
    { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/dashboard/verification', label: 'Verification & Trust', icon: ShieldCheck },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings }
  ];

  const activeItem = navItems.find((item) => item.exact
    ? location.pathname === item.to
    : location.pathname.startsWith(item.to)) || navItems[0];
  const ActiveIcon = activeItem.icon;

  const handleLogout = () => {
    navigate('/', { replace: true });
    void logout();
  };

  return (
    <div className="dashboard-frame">
      <Navbar />
      <div className="dashboard-mobile-bar">
        <button type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open workspace navigation"><Menu size={20} /></button>
        <div><ActiveIcon size={16} /><span>{activeItem.label}</span></div>
        <button type="button" onClick={handleLogout} aria-label="Sign out"><LogOut size={19} /></button>
      </div>

      <div className="dashboard-layout">
        {mobileNavOpen && <button type="button" className="dashboard-mobile-overlay" aria-label="Close workspace navigation" onClick={() => setMobileNavOpen(false)} />}
        <aside className={`dashboard-sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
          <div className="dashboard-drawer-head">
            <div><span>Brand workspace</span><strong>{currentBrand?.name || user.email}</strong></div>
            <button type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close workspace navigation"><X size={20} /></button>
          </div>

          {currentBrand && (
            <div className="dashboard-brand-switcher">
              {currentBrand.logoUrl ? <img src={currentBrand.logoUrl} alt="" /> : <span className="dashboard-brand-fallback">{currentBrand.name?.charAt(0)?.toUpperCase() || 'B'}</span>}
              <div>
                <strong>{currentBrand.name}</strong>
                <Link to={`/brand/${currentBrand.slug}`}>View public page <ExternalLink size={11} /></Link>
              </div>
            </div>
          )}

          <span className="dashboard-nav-caption">Manage your presence</span>
          <nav className="dashboard-sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} end={item.exact} className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
                  <span className="dashboard-nav-icon"><Icon size={18} /></span>
                  <span className="dashboard-nav-label">{item.label}</span>
                  {item.badge > 0 ? <span className="dashboard-nav-badge">{item.badge}</span> : <ChevronRight size={14} className="dashboard-nav-chevron" />}
                </NavLink>
              );
            })}
          </nav>

          <div className="dashboard-sidebar-footer">
            <div><small>Signed in as</small><strong>{user.email}</strong></div>
            <button type="button" onClick={handleLogout}><LogOut size={17} /><span>Sign out</span></button>
          </div>
        </aside>

        <main className="dashboard-main">
          {brandLoading
            ? <div className="workspace-loading"><span className="workspace-loading-mark" />Loading your brand profile...</div>
            : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
