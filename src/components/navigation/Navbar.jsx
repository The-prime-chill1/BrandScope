import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../common/Logo';
import { InstallAppButton } from '../common/InstallAppButton';
import {
  Search,
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  User,
  Compass,
  LayoutGrid,
  Rss,
  Info,
  ShieldCheck,
  Settings,
} from 'lucide-react';

const publicNavItems = [
  { to: '/discover', label: 'Discover', description: 'Search brands and storefronts', icon: Compass },
  { to: '/categories', label: 'Categories', description: 'Browse by commercial industry', icon: LayoutGrid },
  { to: '/feed', label: 'Brand Feed', description: 'Read official business updates', icon: Rss },
  { to: '/about', label: 'About', description: 'Why BRANDSCOPE exists', icon: Info },
];

export const Navbar = () => {
  const { user, currentBrand, logout, unreadNotifCount } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [mobileOpen]);

  // Add scroll listener for navbar shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!profileDropdown) return;
    const handleClick = () => setProfileDropdown(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [profileDropdown]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    setProfileDropdown(false);
    navigate('/');
  };

  return (
    <>
      <header
        className="main-nav"
        style={{
          boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
          borderBottomColor: scrolled ? 'var(--color-border)' : 'transparent'
        }}
      >
        <div className="container nav-container">
          {/* Logo */}
          <Link to="/" className="nav-brand">
            <Logo size={32} showWordmark={true} />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="nav-desktop-links" aria-label="Primary navigation">
            {publicNavItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {item.label === 'Brand Feed' ? 'Feed' : item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Search */}
          <form onSubmit={handleSearchSubmit} className="nav-search-form">
            <Search size={15} className="nav-search-icon" />
            <input
              type="search"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nav-search-input"
            />
          </form>

          {/* Right Actions */}
          <div className="nav-actions">
            <InstallAppButton compact className="nav-install-control" />
            {user ? (
              <>
                {/* Notification Bell */}
                <Link to="/dashboard/notifications" className="nav-icon-btn" title="Notifications">
                  <Bell size={19} />
                  {unreadNotifCount > 0 && (
                    <span className="nav-notif-dot">{unreadNotifCount}</span>
                  )}
                </Link>

                {/* Profile / Account Menu */}
                <div className="nav-profile-wrap">
                  {currentBrand?.logoUrl ? (
                    <button
                      type="button"
                      className="nav-profile-btn"
                      title={currentBrand.name}
                      aria-label="Open account menu"
                      aria-expanded={profileDropdown}
                      onClick={(event) => { event.stopPropagation(); setProfileDropdown((visible) => !visible); }}
                    >
                      <img
                        src={currentBrand.logoUrl}
                        alt=""
                        className="nav-profile-avatar"
                      />
                      <ChevronDown size={14} className="nav-profile-chevron" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="nav-profile-btn"
                      aria-label="Open account menu"
                      aria-expanded={profileDropdown}
                      onClick={(event) => { event.stopPropagation(); setProfileDropdown((visible) => !visible); }}
                    >
                      <div className="nav-profile-avatar nav-profile-avatar--placeholder">
                        <User size={16} />
                      </div>
                      <ChevronDown size={14} className="nav-profile-chevron" />
                    </button>
                  )}

                  {/* Dropdown */}
                  {profileDropdown && (
                    <div className="nav-dropdown" onClick={(event) => event.stopPropagation()}>
                      <div className="nav-dropdown-header">
                        <span className="nav-dropdown-eyebrow">Signed-in workspace</span>
                        <span className="nav-dropdown-brand">{currentBrand?.name || 'BRANDSCOPE member'}</span>
                        <span className="nav-dropdown-email">{user.email}</span>
                      </div>
                      <Link to="/dashboard" className="nav-dropdown-item">
                        <span className="nav-dropdown-item-icon"><LayoutDashboard size={16} /></span>
                        <span><strong>Dashboard</strong><small>Manage your brand workspace</small></span>
                      </Link>
                      {currentBrand && (
                        <Link to={`/brand/${currentBrand.slug}`} className="nav-dropdown-item">
                          <span className="nav-dropdown-item-icon"><User size={16} /></span>
                          <span><strong>Public profile</strong><small>See what visitors discover</small></span>
                        </Link>
                      )}
                      <Link to="/dashboard/settings" className="nav-dropdown-item">
                        <span className="nav-dropdown-item-icon"><Settings size={16} /></span>
                        <span><strong>Account settings</strong><small>Security and profile controls</small></span>
                      </Link>
                      <div className="nav-dropdown-divider" />
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="nav-dropdown-item nav-dropdown-item--danger"
                      >
                        <span className="nav-dropdown-item-icon"><LogOut size={16} /></span>
                        <span><strong>Sign out</strong><small>End this secure session</small></span>
                      </button>
                    </div>
                  )}
                </div>
                <button type="button" className="nav-signout-quick" onClick={handleLogout} title="Sign out">
                  <LogOut size={17} />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <div className="nav-auth-btns">
                <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">List Your Brand</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              className="nav-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-down Menu */}
      {mobileOpen && (
        <>
          <button type="button" className="nav-mobile-overlay" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
          <aside className="nav-mobile-menu" aria-label="Mobile navigation">
            <div className="nav-mobile-intro">
              <span><ShieldCheck size={13} /> Business-only network</span>
              <strong>Explore BRANDSCOPE</strong>
              <small>Discover trusted companies, products, and official brand updates.</small>
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="nav-mobile-search">
              <Search size={16} />
              <input
                type="search"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <nav className="nav-mobile-links" aria-label="Explore BRANDSCOPE">
              {publicNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `nav-mobile-link ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="nav-mobile-link-icon"><Icon size={18} /></span>
                    <span className="nav-mobile-link-copy"><strong>{item.label}</strong><small>{item.description}</small></span>
                    <ChevronRight size={16} className="nav-mobile-link-arrow" />
                  </NavLink>
                );
              })}
            </nav>

            <div className="nav-mobile-divider" />

            {user ? (
              <div className="nav-mobile-actions">
                <div className="nav-mobile-account">
                  <span className="nav-mobile-account-avatar">
                    {currentBrand?.logoUrl ? <img src={currentBrand.logoUrl} alt="" /> : <User size={18} />}
                  </span>
                  <span><small>Signed in as</small><strong>{currentBrand?.name || user.email}</strong></span>
                </div>
                <Link to="/dashboard" className="btn btn-secondary btn-block" onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                {currentBrand && (
                  <Link to={`/brand/${currentBrand.slug}`} className="btn btn-outline btn-block" onClick={() => setMobileOpen(false)}>
                    View Brand Profile
                  </Link>
                )}
                <button type="button" onClick={handleLogout} className="btn btn-ghost btn-block">
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="nav-mobile-actions">
                <div className="nav-mobile-guest">
                  <span><ShieldCheck size={18} /></span>
                  <div><strong>Own a business?</strong><small>Create a professional, searchable brand presence.</small></div>
                </div>
                <Link to="/login" className="btn btn-outline btn-block" onClick={() => setMobileOpen(false)}>
                  Log In
                </Link>
                <Link to="/signup" className="btn btn-primary btn-block" onClick={() => setMobileOpen(false)}>
                  List Your Brand
                </Link>
              </div>
            )}

            <InstallAppButton className="nav-mobile-install" />
            <div className="nav-mobile-powered">Built and powered by <a href="https://chilltechltd.com" target="_blank" rel="noopener noreferrer">CHILL TECH LTD</a></div>
          </aside>
        </>
      )}
    </>
  );
};

export default Navbar;
