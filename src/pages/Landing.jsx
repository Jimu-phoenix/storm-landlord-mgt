import React, {useState} from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import '../styles/Landing.css';
import { CheckCircle, BarChart3, Shield, Smartphone, Wifi, WifiOff, Download, Upload, Calendar, Users, CreditCard, FileText, ArrowRight } from 'lucide-react'

export default function Landing() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (email && email.includes('@')) {
      setMessage('Thank you for your interest! We\'ll be in touch soon.');
      setEmail('');
    } else {
      setMessage('Please enter a valid email address.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  
  return (
    <>
      <Nav />
      
      <main>
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <h1 className="hero-title">
                <span className="code-bracket">{"{"}</span>SmartLord
                <span className="code-bracket">{"}"}</span><br/>
                Smart Hostel Management
              </h1>
              <p className="hero-subtitle">
                Transform your hostel operations with our intuitive platform. 
                Real-time insights, automated bookings, and seamless management—all in one place.
              </p>
              <div className="hero-benefits">
                <div className="benefit-item">
                  <CheckCircle className="benefit-icon" size={20} />
                  <span>No technical skills needed</span>
                </div>
                <div className="benefit-item">
                  <CheckCircle className="benefit-icon" size={20} />
                  <span>Set up in 5 minutes</span>
                </div>
                <div className="benefit-item">
                  <CheckCircle className="benefit-icon" size={20} />
                  <span>Completely Free Forever</span>
                </div>
              </div>
              
              <div className="hero-form">
                <input
                  type="email"
                  className="hero-input"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button 
                  onClick={handleSubmit} 
                  className="hero-button"
                >
                  <ArrowRight size={18} />
                  Get Started Free
                </button>
              </div>
              
              <p className="hero-note">
                No subscriptions · No payments · No hidden fees
              </p>
              
              {message && (
                <p className="hero-message">
                  <CheckCircle size={16} />
                  {message}
                </p>
              )}
            </div>
            
            <div className="hero-demo">
              <div className="demo-header">
                <div className="demo-dot"></div>
                <div className="demo-dot"></div>
                <div className="demo-dot"></div>
                <div className="demo-title">SmartLord Dashboard Preview</div>
              </div>
              <div className="demo-body">
                <div className="demo-metrics">
                  <div className="metric">
                    <div className="metric-value">95%</div>
                    <div className="metric-label">Occupancy Rate</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">24</div>
                    <div className="metric-label">Active Bookings</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">$8,450</div>
                    <div className="metric-label">This Month</div>
                  </div>
                </div>
                
                <div className="demo-feature">
                  <div className="feature-icon">
                    <BarChart3 size={24} />
                  </div>
                  <div className="feature-info">
                    <div className="feature-title">Live Dashboard</div>
                    <div className="feature-desc">See everything at a glance</div>
                  </div>
                </div>
                
                <div className="demo-feature">
                  <div className="feature-icon">
                    <Calendar size={24} />
                  </div>
                  <div className="feature-info">
                    <div className="feature-title">Auto Bookings</div>
                    <div className="feature-desc">Confirmations sent instantly</div>
                  </div>
                </div>
                
                <div className="demo-feature">
                  <div className="feature-icon">
                    <Users size={24} />
                  </div>
                  <div className="feature-info">
                    <div className="feature-title">Guest Management</div>
                    <div className="feature-desc">Track all guest information</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section className="how-to-section" id="how-it-works">
          <div className="how-to-container">
            <div className="section-header">
              <span className="section-badge">GET STARTED</span>
              <h2 className="section-title">How SmartLord Works</h2>
              <p className="section-subtitle">Simple steps to transform your hostel management</p>
            </div>
            
            <div className="steps-container">
              <div className="step-card">
                <div className="step-number">01</div>
                <div className="step-icon">
                  <FileText size={32} />
                </div>
                <h3 className="step-title">Sign Up Free</h3>
                <p className="step-description">
                  Create your account in seconds. No credit card or payment information required.
                </p>
              </div>
              
              <div className="step-card">
                <div className="step-number">02</div>
                <div className="step-icon">
                  <Smartphone size={32} />
                </div>
                <h3 className="step-title">Add Your Properties</h3>
                <p className="step-description">
                  Input your hostel details, rooms, rates, and amenities in minutes.
                </p>
              </div>
              
              <div className="step-card">
                <div className="step-number">03</div>
                <div className="step-icon">
                  <Calendar size={32} />
                </div>
                <h3 className="step-title">Start Managing</h3>
                <p className="step-description">
                  Begin accepting bookings, managing guests, and tracking payments immediately.
                </p>
              </div>
              
              <div className="step-card">
                <div className="step-number">04</div>
                <div className="step-icon">
                  <BarChart3 size={32} />
                </div>
                <h3 className="step-title">Grow Your Business</h3>
                <p className="step-description">
                  Use insights and automation to optimize occupancy and increase revenue.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section" id="features">
          <div className="features-container">
            <div className="section-header">
              <span className="section-badge">FEATURES</span>
              <h2 className="section-title">Everything You Need, All in One Place</h2>
              <p className="section-subtitle">
                Powerful tools designed specifically for hostel management in Malawi
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <BarChart3 size={24} />
                </div>
                <h3 className="feature-title">Live Dashboard</h3>
                <p className="feature-description">
                  See all your properties at a glance with real-time updates on occupancy, revenue, and bookings.
                </p>
                <div className="feature-benefits">
                  <div className="benefit"><CheckCircle size={16} /> Instant updates</div>
                  <div className="benefit"><CheckCircle size={16} /> Visual reports</div>
                  <div className="benefit"><CheckCircle size={16} /> Mobile friendly</div>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Shield size={24} />
                </div>
                <h3 className="feature-title">Secure & Reliable</h3>
                <p className="feature-description">
                  Bank-level security protects your data and payments. Never worry about security breaches.
                </p>
                <div className="feature-benefits">
                  <div className="benefit"><CheckCircle size={16} /> Encrypted payments</div>
                  <div className="benefit"><CheckCircle size={16} /> Daily backups</div>
                  <div className="benefit"><CheckCircle size={16} /> 24/7 monitoring</div>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Users size={24} />
                </div>
                <h3 className="feature-title">Guest Management</h3>
                <p className="feature-description">
                  Complete guest profiles, check-in/out management, and communication tools.
                </p>
                <div className="feature-benefits">
                  <div className="benefit"><CheckCircle size={16} /> Guest profiles</div>
                  <div className="benefit"><CheckCircle size={16} /> Communication log</div>
                  <div className="benefit"><CheckCircle size={16} /> Preference tracking</div>
                </div>
              </div>
            </div>

            <div className="features-cta">
              <h3 className="cta-title">Ready to Simplify Your Hostel Management?</h3>
              <p className="cta-description">
                Join hostel owners across Malawi who save time and grow their business with SmartLord.
              </p>
              <div className="cta-buttons">
                <button className="cta-button primary" onClick={handleSubmit}>
                  Get Started Free
                </button>
              </div>
              <div className="cta-note">100% Free · No limitations · Made for Malawi</div>
            </div>
          </div>
        </section>

        {/* Offline Mode Section */}
        <section className="offline-section" id="offline">
          <div className="offline-container">
            <div className="section-header">
              <span className="section-badge">SPECIAL FEATURE</span>
              <h2 className="section-title">Work Anywhere, Even Offline</h2>
              <p className="section-subtitle">
                Designed for areas with intermittent internet connectivity across Malawi
              </p>
            </div>
            
            <div className="offline-content">
              <div className="offline-features">
                <div className="offline-feature">
                  <div className="offline-icon online">
                    <Wifi size={32} />
                  </div>
                  <h3>Online Sync</h3>
                  <p>Automatic sync when internet is available. All changes update in real-time.</p>
                </div>
                
                <div className="offline-feature">
                  <div className="offline-icon offline">
                    <WifiOff size={32} />
                  </div>
                  <h3>Offline Mode</h3>
                  <p>Continue managing properties, recording payments, and checking guests without internet.</p>
                </div>
                
                <div className="offline-feature">
                  <div className="offline-icon sync">
                    <Download size={32} />
                  </div>
                  <h3>Smart Sync</h3>
                  <p>Changes made offline automatically sync when you're back online. No data loss.</p>
                </div>
              </div>
              
              <div className="offline-demo">
                <div className="demo-card">
                  <div className="demo-header-small">
                    <div className="demo-dot"></div>
                    <div className="demo-dot"></div>
                    <div className="demo-dot"></div>
                    <div className="demo-title">Offline Mode Active</div>
                  </div>
                  <div className="demo-content">
                    <div className="connection-status">
                      <WifiOff className="status-icon" size={20} />
                      <span>Currently Offline</span>
                    </div>
                    <div className="demo-actions">
                      <div className="action">
                        <CheckCircle size={16} />
                        <span>Record payments</span>
                      </div>
                      <div className="action">
                        <CheckCircle size={16} />
                        <span>Check guests in/out</span>
                      </div>
                      <div className="action">
                        <CheckCircle size={16} />
                        <span>Update room status</span>
                      </div>
                      <div className="action">
                        <CheckCircle size={16} />
                        <span>Add new bookings</span>
                      </div>
                    </div>
                    <div className="pending-sync">
                      <Upload size={16} />
                      <span>3 changes pending sync</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </>
  );
}