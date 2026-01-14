import React from 'react';
import '../styles/footer.css';
import { MailIcon, Phone } from 'lucide-react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Smart-Lord</h3>
          <p>Malawi's Premier Property Management Solution</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#features">How It works</a></li>
            <li><a href="#support">Support</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <div className='contact-p'> <MailIcon size={18}/> <a href="mailto:smart-Lord@gmail.com">smart-Lord@gmail.com</a></div>
          <div className='contact-p'> <Phone size={18}/> <a href="tel:+265 884 560 736">+265 884 560 736</a></div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 Smart-Lord. Built for Malawian property owners.</p>
      </div>
    </footer>
  );
}

export default Footer;