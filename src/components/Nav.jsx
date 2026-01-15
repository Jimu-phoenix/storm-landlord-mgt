import React, { useState } from 'react';
import '../styles/Nav.css';
import { MenuIcon, X,Activity } from 'lucide-react';

function Nav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo-section">
          <div className="brand-logo">
            <div className="brand-wrapper">
              <span className="logo-symbol">
                <Activity size={18} />
              </span>
              <h1 className="brand-name">SmartLoad</h1>
            </div>
          </div>
        </div>
        
        <ul className="nav-menu">
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#offline">Offline Mode</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        
        <div className="nav-buttons">
          <a href={'/login'}><button className="btn btn-outline">Login</button></a>
          <button className="btn btn-primary">Get Started</button>
        </div>
        
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <ul className="mobile-nav-menu">
          <li><a href="#how-it-works" onClick={closeMobileMenu}>How It Works</a></li>
          <li><a href="#offline" onClick={closeMobileMenu}>Offline Mode</a></li>
          <li><a href="#contact" onClick={closeMobileMenu}>Contact</a></li>
        </ul>
        
        <div className="mobile-nav-buttons">
          <a href={'/login'}><button className="btn btn-outline" onClick={closeMobileMenu}>Login</button></a>
          <button className="btn btn-primary" onClick={closeMobileMenu}>Get Started</button>
        </div>
      </div>
    </nav>
  );
}

export default Nav;