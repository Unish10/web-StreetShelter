import { Link } from "react-router-dom";
import { useState } from "react";
import "./Landing.css";

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMenuOpen(false);
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-container">
      
      <header className="header">
        <div className="header-content">
          <div className="header-inner">
            <Link to="/" className="logo-link">
              <img src="/logo.svg" alt="StreetShelter" className="logo-image" style={{width: '50px', height: 'auto'}} />
            </Link>

            <nav className="nav-desktop">
              <button onClick={() => scrollToSection('rescues')} className="nav-button">
                Active Rescues
              </button>
              <button onClick={() => scrollToSection('how')} className="nav-button">
                How It Works
              </button>
              <Link to="/" className="nav-link">
                About Us
              </Link>
              <div className="nav-divider"></div>
              <Link to="/role-selection" className="nav-link">
                Sign In
              </Link>
              <Link to="/admin/login" className="nav-link">
                Admin
              </Link>
            </nav>

            <button
              className="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="mobile-menu">
              <button onClick={() => scrollToSection('rescues')} className="mobile-menu-item">
                Active Rescues
              </button>
              <button onClick={() => scrollToSection('how')} className="mobile-menu-item">
                How It Works
              </button>
              <Link to="/" className="mobile-menu-item">
                About Us
              </Link>
              <div className="mobile-menu-divider"></div>
              <Link to="/role-selection" className="mobile-menu-item">
                Sign In
              </Link>
              <Link to="/admin/login" className="mobile-menu-item">
                Admin Login
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main>
        {/* HERO SECTION */}
        <section className="hero-section">
          {/* Background Image - Right Side */}
          <div className="hero-bg-image">
            <img 
              src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80"
              alt="Dog" 
            />
            <div className="hero-gradient"></div>
          </div>

          
          <div className="hero-content">
            <div className="hero-card">
              <div className="hero-badge">
                — 24/7 REAL TIME RESPONSE PLATFORM
              </div>

              <h1 className="hero-title">
                Giving every paw a<br />
                <span className="hero-title-highlight">second chance.</span>
              </h1>

              <p className="hero-description">
                The intelligence layer for animal welfare. We connect citizens, rescue teams, and professional shelters through a unified real-time dashboard.
              </p>

              <div className="hero-buttons">
                <Link to="/register" className="btn-hero-primary">
                  Get Started
                </Link>
                <button onClick={() => scrollToSection('rescues')} className="btn-secondary">
                  View Active Cases
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* URGENT RESCUE CASES */}
        <section id="rescues" className="rescue-section">
          <div className="container">
            <div className="section-header">
              <div className="section-header-content">
                <h2 className="section-title">Urgent Rescue Cases</h2>
                <p className="section-description">Immediate action required for these critical situations currently active in our network.</p>
              </div>
              <Link to="/register" className="browse-link">
                Browse All Cases
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="rescue-grid">
              {[
                {
                  image: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&q=80",
                  badge: "URGENT",
                  badgeClass: "badge-urgent",
                  progressClass: "badge-urgent",
                  name: "Luna & Pups",
                  desc: "Nursing mother dog found in a heavy industrial zone. Requires medical transport and foster placement today.",
                  location: "Proximity",
                  locationValue: "1.2 MILES AWAY",
                  progress: "68%",
                  action: "Respond Now"
                },
                {
                  image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80",
                  badge: "PRIORITY",
                  badgeClass: "badge-priority",
                  progressClass: "badge-priority",
                  name: "Oliver",
                  desc: "Senior cat showing signs of severe dehydration. Needs emergency IV fluids and dedicated care at the sanctuary.",
                  location: "Need Amount",
                  locationValue: "$840 / $1,200",
                  progress: "70%",
                  action: "Donate Essentials"
                },
                {
                  image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
                  badge: "ACTIVE SEARCH",
                  badgeClass: "badge-active",
                  progressClass: "badge-active",
                  name: "Scout",
                  desc: "Lost mixed breed discovered by volunteers. Currently scanning for microchips and coordinating with local agencies.",
                  location: "Time Active",
                  locationValue: "4 HOURS",
                  progress: "45%",
                  action: "Volunteer Search"
                }
              ].map((caseItem, i) => (
                <div key={i} className="rescue-card">
                  <div className="rescue-image-container">
                    <img alt={caseItem.name} className="rescue-image" src={caseItem.image} />
                    <span className={`rescue-badge ${caseItem.badgeClass}`}>
                      {caseItem.badge}
                    </span>
                  </div>
                  <div className="rescue-content">
                    <h3 className="rescue-name">{caseItem.name}</h3>
                    <p className="rescue-description">{caseItem.desc}</p>
                    <div className="rescue-meta">
                      <span className="rescue-meta-label">{caseItem.location}</span>
                      <span className="rescue-meta-value">{caseItem.locationValue}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="progress-bar">
                      <div className={`progress-fill ${caseItem.progressClass}`} style={{width: caseItem.progress}}></div>
                    </div>
                    <Link to="/register" className="btn-action">
                      {caseItem.action}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE RESCUE PROTOCOL */}
        <section id="how" className="protocol-section">
          <div className="container">
            <div className="protocol-header">
              <h2 className="protocol-title">The Rescue Protocol</h2>
              <p className="protocol-description">Our streamlined process ensures every report is verified and every animal is cared for with professional precision.</p>
            </div>

            <div className="protocol-grid">
              {[
                {
                  icon: (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  number: "01",
                  label: "INITIAL PHASE",
                  title: "Detection",
                  desc: "Database and mapping verify our data and also to flagged areas. Coordinating efforts through an AI-driven, real-time volunteer network in high-risk urban areas."
                },
                {
                  icon: (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                  number: "02",
                  label: "FIELD ACTION",
                  title: "Deployment",
                  desc: "Certified rescue teams are dispatched within minutes. Real-time coordination with medical expertise and specialized gear for complete recoveries."
                },
                {
                  icon: (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  ),
                  number: "03",
                  label: "LONG-TERM CARE",
                  title: "Rehabilitation",
                  desc: "Full veterinary screenings and adaptive sanctuary or foster homes. Follow-up medical care within our network of high-standard shelters."
                }
              ].map((step, i) => (
                <div key={i} className="protocol-step">
                  <div className="protocol-icon">
                    {step.icon}
                  </div>
                  <div className="protocol-step-header">
                    <span className="protocol-label">{step.label}</span>
                    <div className="protocol-title-wrapper">
                      <span className="protocol-number">{step.number}.</span>
                      <h3 className="protocol-step-title">{step.title}</h3>
                    </div>
                  </div>
                  <p className="protocol-step-description">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INFRASTRUCTURE FOR IMPACT */}
        <section className="infrastructure-section">
          <div className="container">
            <div className="infrastructure-bg">
              <svg viewBox="0 0 500 400">
                <circle cx="250" cy="200" r="3" fill="#3b82f6" />
                <circle cx="180" cy="150" r="2" fill="#3b82f6" />
                <circle cx="320" cy="180" r="2" fill="#3b82f6" />
                <circle cx="200" cy="250" r="2" fill="#3b82f6" />
                <circle cx="350" cy="220" r="2" fill="#3b82f6" />
                <circle cx="280" cy="280" r="2" fill="#3b82f6" />
                <line x1="250" y1="200" x2="180" y2="150" stroke="#3b82f6" strokeWidth="0.5" />
                <line x1="250" y1="200" x2="320" y2="180" stroke="#3b82f6" strokeWidth="0.5" />
                <line x1="250" y1="200" x2="200" y2="250" stroke="#3b82f6" strokeWidth="0.5" />
                <line x1="250" y1="200" x2="350" y2="220" stroke="#3b82f6" strokeWidth="0.5" />
                <line x1="320" y1="180" x2="350" y2="220" stroke="#3b82f6" strokeWidth="0.5" />
              </svg>
            </div>
            <div className="infrastructure-header">
              <h2 className="infrastructure-title">Infrastructure for Impact</h2>
              <p className="infrastructure-description">We provide the enabling backbone for animal welfare organizations, allowing them to focus on what matters most: saving lives.</p>
            </div>

            <div className="infrastructure-list">
              {[
                {
                  icon: (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  ),
                  title: "Live Resource Inventory",
                  desc: "Real-time tracking of available beds and medical supplies across all shelters."
                },
                {
                  icon: (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ),
                  title: "Vetted Rescue Network",
                  desc: "RSPCA-background-checked and training verification for all volunteer responders."
                },
                {
                  icon: (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: "Transparent Funding",
                  desc: "Direct-to-case donations with blockchain-verified impact records."
                }
              ].map((feature, i) => (
                <div key={i} className="infrastructure-item">
                  <div className="infrastructure-icon">
                    {feature.icon}
                  </div>
                  <div className="infrastructure-content">
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Link to="/" className="footer-brand">
                <img src="/logo.svg" alt="StreetShelter" className="footer-logo-image" style={{width: '100px', height: 'auto'}} />
              </Link>
              <p className="footer-tagline">
                Modernizing animal welfare. Saving lives through technology and dedicated volunteers.
              </p>
            </div>
            
            <div className="footer-column">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/register">Report Dog</Link></li>
                <li><Link to="/">Active Cases</Link></li>
                <li><Link to="/">Shelter Login</Link></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>Company</h4>
              <ul className="footer-links">
                <li><Link to="/">Our Impact</Link></li>
                <li><Link to="/">Success Stories</Link></li>
                <li><Link to="/">Contact Support</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Newsletter</h4>
              <p className="newsletter-text">Stay updated on the latest rescue initiatives and community efforts.</p>
              <div className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="newsletter-input"
                />
                <button className="newsletter-button">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p className="footer-copyright">© 2025 StreetShelter. All rights reserved. Intelligent Corporation.</p>
            <div className="footer-legal">
              <Link to="/">Privacy Policy</Link>
              <Link to="/">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
