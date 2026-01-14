import React from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import '../styles/Landing.css';
import { HouseIcon, Search, Smartphone } from 'lucide-react'

export default function Landing() {
  return (
    <>
      <Nav />
      
      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="landing-container">
            <div className="hero-content">
              <div className="hero-text">
                <h1>Malawi's Premier Property Management Platform</h1>
                <p>Streamline your property business with our offline-capable solution designed specifically for Malawian landlords and tenants.</p>
                <div className="hero-btns">
                    <button className="btn btn-primary">Start Managing Properties</button>
                    <button className="btn btn-primary">Search for Hostel/House</button>
                </div>
              </div>
              <div className="hero-image">
                <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Modern Property Image From Unsplash" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features" id="features">
          <div className="landing-container">
            <h2 className="section-title">Powerful Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon"><HouseIcon size={48}/></div>
                <h3>Property Management</h3>
                <p>Easily manage multiple properties, tenants, rent collection, and maintenance requests.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon"><Search size={48}/></div>
                <h3>Smart Search</h3>
                <p>Tenants can find houses and hostels tailored to students and working professionals.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon"><Smartphone size={48}/></div>
                <h3>Mobile-First</h3>
                <p>Access your dashboard anywhere, perfect for Malawi's mobile-first environment.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Offline Feature */}
        <section className="offline-section" id="offline">
          <div className="landing-container">
            <div className="offline-content">
              <div className="offline-image">
                <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Working offline" className='offlineImg'/>
              </div>
              <div className="offline-text">
                <h2>Reliable Offline Operation</h2>
                <p>Continue managing properties even without internet connectivity. Perfect for areas with intermittent connectivity across Malawi.</p>
                <ul>
                  <li>Record rent payments offline</li>
                  <li>Add new properties without internet</li>
                  <li>Sync automatically when back online</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Search Preview */}
        <section className="search-preview" id="how-it-works">
          <div className="landing-container">
            <h2 className="section-title">Find Your Perfect Space</h2>
            <div className="search-box">
              <div className="search-inputs">
                <div className="input-group">
                  <label>Property Type</label>
                  <select>
                    <option>House</option>
                    <option>Hostel</option>
                  </select>
                </div>
                
                <div className="input-group">
                  <label>Location</label>
                  <input type="text" placeholder="e.g., Lilongwe, Blantyre, Mzuzu" />
                </div>
                
                <div className="input-group">
                  <label>Price Range (MWK)</label>
                  <select>
                    <option>50,000 - 100,000</option>
                    <option>150,000 - 200,000</option>
                    <option>250,000 - 350,000</option>
                    <option>350,000+</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary search-btn">Search Properties</button>
            </div>
          </div>
        </section>
{/* 
        {/* CTA Section 
        <section className="cta-section">
          <div className="landing-container">
            <div className="cta-content">
              <h2>Join Malawian Property Owners Using Smart-Lord</h2>
              <p>Simplify your property management today with our Malawi-built solution.</p>
              <div className="cta-buttons">
                <button className="btn btn-primary">Start Free Trial</button>
                <button className="btn btn-outline">Schedule Demo</button>
              </div>
            </div>
          </div>
        </section> */}
      </main>
      
      <Footer />
    </>
  );
}