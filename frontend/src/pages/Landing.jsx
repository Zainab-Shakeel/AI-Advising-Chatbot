import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing-root">
      <header className="landing-header">
        <div className="header-container">
          <div className="header-left">
            <Link to="/" className="logo">Tawjeeh Bot</Link>
            <span className="tagline">Intelligent Academic Planning Solutions</span>
          </div>

          <nav className="nav">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#about" className="nav-link">About</a>
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
          </nav>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero">
          <div className="hero-container">
            <div className="hero-content">
              <div className="hero-badge">Powered by Advanced AI Technology</div>
              <h1 className="hero-title">
                Transform Your Academic Journey with Intelligent Course Planning
              </h1>
              <p className="hero-description">
                Leverage cutting-edge artificial intelligence to receive personalized academic guidance, 
                comprehensive course recommendations, and strategic degree planning tailored to your 
                educational objectives and program requirements.
              </p>
              <div className="hero-ctas">
                <Link to="/signup" className="btn btn-primary btn-large">Begin Your Journey</Link>
                <Link to="/login" className="btn btn-secondary btn-large">Sign In</Link>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Availability</div>
                </div>
                <div className="stat">
                  <div className="stat-number">100%</div>
                  <div className="stat-label">Privacy Protected</div>
                </div>
                <div className="stat">
                  <div className="stat-number">AI-Powered</div>
                  <div className="stat-label">Intelligent Guidance</div>
                </div>
              </div>
            </div>
            <div className="hero-visual" aria-hidden>
              <div className="visual-card">
                <div className="visual-content">
                  <div className="chat-bubble">Academic Planning Assistant</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="section how-it-works">
          <div className="section-header">
            <span className="section-label">Process</span>
            <h2>How It Works</h2>
            <p className="section-description">
              Our streamlined three-step process ensures you receive comprehensive academic guidance
            </p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-number">01</div>
              <div className="step-content">
                <h3>Account Creation</h3>
                <p>Establish your secure account using your institutional credentials to begin your personalized academic planning experience.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">02</div>
              <div className="step-content">
                <h3>Program Configuration</h3>
                <p>Provide your degree program, major, academic goals, and any specific constraints or preferences for customized recommendations.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">03</div>
              <div className="step-content">
                <h3>Receive Strategic Guidance</h3>
                <p>Obtain comprehensive course sequencing, elective recommendations, prerequisite mapping, and actionable next steps for your academic pathway.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="section features">
          <div className="section-header">
            <span className="section-label">Capabilities</span>
            <h2>Comprehensive Features</h2>
            <p className="section-description">
              Advanced tools designed to support your academic success
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Intelligent Chat Interface</h3>
              <p>Engage with an AI-powered conversational assistant for instant, accurate responses to academic inquiries.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Degree-Aware Planning</h3>
              <p>Advanced algorithms analyze your program requirements to generate optimal course sequences and academic pathways.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Real-Time Progress Tracking</h3>
              <p>Monitor your academic advancement with dynamic progress visualization, credit hour tracking, and completion percentage analysis to ensure timely degree fulfillment.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Personalized Recommendations</h3>
              <p>Receive AI-driven course suggestions tailored to your academic performance, career aspirations, and learning preferences for optimized educational outcomes.</p>
            </div>
          </div>
        </section>

        <section id="about" className="section about-bot">
          <div className="section-header">
            <span className="section-label">Overview</span>
            <h2>About the Platform</h2>
          </div>
          <div className="about-content">
            <p className="about-text">
              The AI Advising Bot represents a sophisticated academic planning solution designed to 
              enhance the student advising experience through intelligent automation. Our platform 
              synthesizes complex program regulations, institutional policies, and established 
              advising methodologies to deliver personalized course recommendations and strategic 
              academic guidance.
            </p>
            <p className="about-text">
              This system serves as a complementary tool to traditional human advising services, 
              enabling students to arrive at advising appointments better prepared with informed 
              questions and preliminary planning. It is not intended to replace professional academic 
              advisors but rather to augment the advising process and provide accessible support 
              outside of standard office hours.
            </p>
            <div className="about-subsection">
              <h3>Privacy & Security</h3>
              <p>
                All student data is processed and stored in accordance with institutional privacy 
                standards and applicable data protection regulations. The platform employs enterprise-grade 
                security measures to safeguard sensitive information. The system is designed to avoid 
                providing medical, legal, or financial advice and will direct users to appropriate 
                professional resources for complex matters requiring specialized expertise.
              </p>
            </div>
          </div>
        </section>

      </main>

      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-col footer-col-main">
              <div className="footer-logo">Tawjeeh Bot</div>
              <p className="footer-description">
                Empowering students with intelligent academic planning solutions since 2026.
              </p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#about">About</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Documentation</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Tawjeeh Bot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
