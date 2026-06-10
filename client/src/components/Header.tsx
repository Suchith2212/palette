import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaSun, FaMoon, FaPalette } from 'react-icons/fa';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PALETTE_LOGO_URL } from '../constants/branding';
import { toMediaUrl } from '../utils/mediaUrl';
import './Header.css';

const Header = () => {
  const { isLoggedIn, logout, user, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef<HTMLElement | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsNavOpen(false);
    setIsEventsOpen(false);
    setIsAdminOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!headerRef.current) return;
      if (!headerRef.current.contains(event.target as Node)) {
        setIsEventsOpen(false);
        setIsAdminOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile nav open
  useEffect(() => {
    document.body.style.overflow = isNavOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isNavOpen]);

  const handleLogout = () => {
    logout();
    setIsNavOpen(false);
    setIsEventsOpen(false);
    setIsAdminOpen(false);
    navigate('/login');
  };

  if (loading) return null;

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`} ref={headerRef}>
      <nav className="navbar navbar-expand-lg" aria-label="Main navigation">
        <div className="container">
          {/* Brand Logo */}
          <Link className="navbar-brand logo-text" to="/" aria-label="Palette Home">
            <img
              src={toMediaUrl(PALETTE_LOGO_URL)}
              alt="Palette Logo"
              className="navbar-logo"
            />
            <span className="brand-name">Palette</span>
          </Link>

          {/* Mobile Controls Row */}
          <div className="header-mobile-controls">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <FaSun /> : <FaMoon />}
            </button>
            <button
              className="nav-hamburger"
              type="button"
              onClick={() => setIsNavOpen((p) => !p)}
              aria-controls="navbarNav"
              aria-expanded={isNavOpen}
              aria-label="Toggle navigation"
            >
              {isNavOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
            </button>
          </div>

          {/* Nav Links */}
          <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <NavLink className="nav-link" to="/" end>Home</NavLink>
              </li>

              {/* Events Dropdown */}
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle header-dropdown-toggle"
                  id="navbarDropdownEvents"
                  type="button"
                  onClick={() => { setIsEventsOpen((p) => !p); setIsAdminOpen(false); }}
                  aria-expanded={isEventsOpen}
                >
                  Events
                </button>
                <ul className={`dropdown-menu ${isEventsOpen ? 'show' : ''}`} aria-labelledby="navbarDropdownEvents">
                  <li><NavLink className="dropdown-item" to="/upcoming-events">Events</NavLink></li>
                  <li><NavLink className="dropdown-item" to="/workshops">Workshops</NavLink></li>
                  <li><NavLink className="dropdown-item" to="/competitions">Competitions</NavLink></li>
                  <li><NavLink className="dropdown-item" to="/past-events">Past Events</NavLink></li>
                  {isLoggedIn && user?.isAdmin && (
                    <li><NavLink className="dropdown-item" to="/admin/events/select">Select Events</NavLink></li>
                  )}
                </ul>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/e-exhibition">E-exhibition</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/inter-iit">Inter IIT</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/team">Team</NavLink>
              </li>
              {(!isLoggedIn || !user?.isAdmin) && (
                <li className="nav-item">
                  <NavLink className="nav-link" to="/contact-us">Contact Us</NavLink>
                </li>
              )}

              {/* Admin Dropdown */}
              {isLoggedIn && user?.isAdmin && (
                <li className="nav-item dropdown">
                  <button
                    className="nav-link dropdown-toggle header-dropdown-toggle"
                    id="navbarDropdownAdmin"
                    type="button"
                    onClick={() => { setIsAdminOpen((p) => !p); setIsEventsOpen(false); }}
                    aria-expanded={isAdminOpen}
                  >
                    Activity
                  </button>
                  <ul className={`dropdown-menu ${isAdminOpen ? 'show' : ''}`} aria-labelledby="navbarDropdownAdmin">
                    <li><NavLink className="dropdown-item" to="/admin/dashboard">Admin Dashboard</NavLink></li>
                    <li><NavLink className="dropdown-item" to="/admin/artwork-review">Artwork Review</NavLink></li>
                    <li><NavLink className="dropdown-item" to="/admin/contact-responses">Contact Responses</NavLink></li>
                    <li><NavLink className="dropdown-item" to="/admin/events/select">Select Events</NavLink></li>
                  </ul>
                </li>
              )}
            </ul>

            {/* Right-side Auth + Theme */}
            <ul className="navbar-nav header-icons">
              <li className="nav-item d-none d-lg-block">
                <button
                  className="theme-toggle"
                  onClick={toggleTheme}
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? <FaSun /> : <FaMoon />}
                </button>
              </li>
              {isLoggedIn ? (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link nav-link-user" to="/profile">
                      <FaUser size={13} />
                      <span>{user?.name ? user.name.split(' ')[0] : 'Profile'}</span>
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-logout" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/login">Login</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link nav-link-cta" to="/register">
                      Join Us
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
