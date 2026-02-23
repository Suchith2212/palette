import React from 'react';
import './Footer.css';
import { FaInstagram } from 'react-icons/fa'; // Import Instagram icon

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-branding">
          <h5>Palette</h5>
          <p>Art Club of IIT Gandhinagar</p>
          <p><em>Where creativity finds its voice</em></p>
          <div className="social-links mt-3"> {/* Added social links div */}
            <a href="https://www.instagram.com/palette_iitgn/" target="_blank" rel="noopener noreferrer" className="me-3"> {/* Removed text-muted */}
              <FaInstagram size={24} /> {/* Instagram icon */}
            </a>
          </div>
        </div>
        <span className="">© {new Date().getFullYear()} Palette. All rights reserved.</span> {/* Removed text-muted */}
      </div>
    </footer>
  );
};

export default Footer;

