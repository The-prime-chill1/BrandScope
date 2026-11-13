import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../common/Logo';
import { Search, Bell, LayoutDashboard, LogOut, Menu, X, PlusCircle, ChevronDown, User } from 'lucide-react';

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
          <nav className="nav-desktop-links">
            <NavLink to="/discover" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Discover
            </NavLink>
            <NavLink to="/categories" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Categories
            </NavLink>
            <NavLink to="/feed" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Feed
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              About
            </NavLink>
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
                <div className="nav-profile-wrap" onClick={(e) => { e.stopPropagation(); setProfileDropdown(!profileDropdown); }}>
                  {currentBrand ? (
                    <button type="button" className="nav-profile-btn" title={currentBrand.name}>
                      <img
                        src={currentBrand.logoUrl}
                        alt=""
                        className="nav-profile-avatar"
                      />
                      <ChevronDown size={14} className="nav-profile-chevron" />
                    </button>
                  ) : (
                    <button type="button" className="nav-profile-btn">
                      <div className="nav-profile-avatar nav-profile-avatar--placeholder">
                        <User size={16} />
                      </div>
                      <ChevronDown size={14} className="nav-profile-chevron" />
                    </button>
                  )}

                  {/* Dropdown */}
                  {profileDropdown && (
                    <div className="nav-dropdown">
                      {currentBrand && (
                        <div className="nav-dropdown-header">
                          <span className="nav-dropdown-brand">{currentBrand.name}</span>
                          <span className="nav-dropdown-email">{user.email}</span>
                        </div>
                      )}
                      <Link to="/dashboard" className="nav-dropdown-item">
                        <LayoutDashboard size={16} />
                        <span>Dashboard</span>
                      </Link>
                      {currentBrand && (
                        <Link to={`/brand/${currentBrand.slug}`} className="nav-dropdown-item">
                          <User size={16} />
                          <span>View Profile</span>
                        </Link>
                      )}
                      <div className="nav-dropdown-divider" />
                      <button
                        type="button"
                        onClick={logout}
                        className="nav-dropdown-item nav-dropdown-item--danger"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
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
              aria-label="Toggle Navigation"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-down Menu */}
      {mobileOpen && (
        <>
          <div className="nav-mobile-overlay" onClick={() => setMobileOpen(false)} />
          <div className="nav-mobile-menu">
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

            <nav className="nav-mobile-links">
              <NavLink to="/discover" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
                Discover
              </NavLink>
              <NavLink to="/categories" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
                Categories
              </NavLink>
              <NavLink to="/feed" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
                Feed
              </NavLink>
              <NavLink to="/about" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
                About
              </NavLink>
            </nav>

            <div className="nav-mobile-divider" />

            {user ? (
              <div className="nav-mobile-actions">
                <Link to="/dashboard" className="btn btn-secondary btn-block" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                {currentBrand && (
                  <Link to={`/brand/${currentBrand.slug}`} className="btn btn-outline btn-block" onClick={() => setMobileOpen(false)}>
                    View Brand Profile
                  </Link>
                )}
                <button type="button" onClick={() => { logout(); setMobileOpen(false); }} className="btn btn-ghost btn-block">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="nav-mobile-actions">
                <Link to="/login" className="btn btn-outline btn-block" onClick={() => setMobileOpen(false)}>
                  Log In
                </Link>
                <Link to="/signup" className="btn btn-primary btn-block" onClick={() => setMobileOpen(false)}>
                  List Your Brand
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
