import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaEnvelope, FaHeart } from 'react-icons/fa';
import { HiArrowUp } from 'react-icons/hi';
import { toMediaUrl } from '../utils/mediaUrl';
import './Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer" aria-label="Site footer">
      {/* Decorative brush stroke divider */}
      <div className="footer-divider" aria-hidden="true" />

      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <img
              src={toMediaUrl('/uploads/exhibition/logo-transparent.png')}
              alt="Palette logo"
              className="footer-logo-image"
              loading="lazy"
            />
            <h5 className="footer-logo">Palette</h5>
            <p className="footer-tagline">Art Club of IIT Gandhinagar</p>
            <p className="footer-sub">Where creativity finds its voice.</p>
            <a
              href="https://www.instagram.com/palette_iitgn/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-ig-link"
              aria-label="Palette on Instagram"
            >
              <FaInstagram size={18} />
              <span>@palette_iitgn</span>
            </a>
          </div>

          {/* Navigation Column */}
          <div className="footer-nav">
            <p className="footer-col-title">Explore</p>
            <nav aria-label="Footer navigation">
              <Link to="/e-exhibition">E-exhibition</Link>
              <Link to="/upcoming-events">Events</Link>
              <Link to="/workshops">Workshops</Link>
              <Link to="/competitions">Competitions</Link>
              <Link to="/team">Our Team</Link>
              <Link to="/inter-iit">Inter IIT</Link>
            </nav>
          </div>

          {/* Connect Column */}
          <div className="footer-connect">
            <p className="footer-col-title">Get Involved</p>
            <nav aria-label="Footer get involved navigation">
              <Link to="/register">Join Palette</Link>
              <Link to="/submit-artwork">Submit Artwork</Link>
              <Link to="/contact-us">Contact Us</Link>
            </nav>
            <div className="footer-email-row">
              <FaEnvelope size={13} />
              <span>palette@iitgn.ac.in</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <span className="footer-copy">
            © {new Date().getFullYear()} Palette · Art Club of IIT Gandhinagar · Made with{' '}
            <FaHeart style={{ color: '#B11286', display: 'inline', verticalAlign: 'middle' }} size={12} />
          </span>
          <button
            className="footer-back-top"
            onClick={scrollToTop}
            aria-label="Back to top"
            title="Back to top"
          >
            <HiArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;



