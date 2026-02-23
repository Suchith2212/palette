import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Header.css';


const Header = () => {
  const { isLoggedIn, logout, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef<HTMLElement | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    setIsNavOpen(false);
    setIsEventsOpen(false);
    setIsAdminOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!headerRef.current) {
        return;
      }
      if (!headerRef.current.contains(event.target as Node)) {
        setIsEventsOpen(false);
        setIsAdminOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsNavOpen(false);
    setIsEventsOpen(false);
    setIsAdminOpen(false);
    navigate('/login');
  };

  if (loading) {
    return null;
  }

  return (
    <header className="header" ref={headerRef}>
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <Link className="navbar-brand logo-text" to="/">
            <img src="/uploads/exhibition/logo-transparent.png" alt="Palette Logo" className="navbar-logo" />
          </Link>
          <button 
            className="navbar-toggler" 
            type="button" 
            onClick={() => setIsNavOpen((prev) => !prev)}
            aria-controls="navbarNav" 
            aria-expanded={isNavOpen} 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">Home</NavLink>
              </li>
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle btn btn-link"
                  id="navbarDropdownEvents"
                  type="button"
                  onClick={() => {
                    setIsEventsOpen((prev) => !prev);
                    setIsAdminOpen(false);
                  }}
                  aria-expanded={isEventsOpen}
                >
                  Events
                </button>
                <ul className={`dropdown-menu ${isEventsOpen ? 'show' : ''}`} aria-labelledby="navbarDropdownEvents">
                  <li><NavLink className="dropdown-item" to="/upcoming-events">All Events</NavLink></li>
                  <li><NavLink className="dropdown-item" to="/workshops">Workshops</NavLink></li>
                  <li><NavLink className="dropdown-item" to="/competitions">Competitions</NavLink></li>
                  <li><NavLink className="dropdown-item" to="/past-events">Past Events</NavLink></li>
                </ul>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/e-exhibition">
                  E-exhibition
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/inter-iit">
                  Inter IIT
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/team">Team</NavLink>
              </li>
              {/* Conditionally render Contact Us */}
              {(!isLoggedIn || !user?.isAdmin) && (
                <li className="nav-item">
                  <NavLink className="nav-link" to="/contact-us">
                    Contact Us
                  </NavLink>
                </li>
              )}
              {/* Admin dropdown - FIXED */}
              {isLoggedIn && user?.isAdmin && (
                <li className="nav-item dropdown">
                  <button
                    className="nav-link dropdown-toggle btn btn-link"
                    id="navbarDropdownAdmin"
                    type="button"
                    onClick={() => {
                      setIsAdminOpen((prev) => !prev);
                      setIsEventsOpen(false);
                    }}
                    aria-expanded={isAdminOpen}
                  >
                    Activity
                  </button>
                  <ul className={`dropdown-menu ${isAdminOpen ? 'show' : ''}`} aria-labelledby="navbarDropdownAdmin">
                    <li><NavLink className="dropdown-item" to="/admin/artwork-review">Artwork Review</NavLink></li>
                    <li><NavLink className="dropdown-item" to="/admin/contact-responses">Contact Us Responses</NavLink></li>
                  </ul>
                </li>
              )}
            </ul>
            <ul className="navbar-nav header-icons">
              {isLoggedIn ? (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/profile">
                      <FaUser /> {user?.name ? user.name.split(' ')[0] : 'Profile'}
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link btn btn-link" onClick={handleLogout}>
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
                    <NavLink className="nav-link" to="/register">Sign Up</NavLink>
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
