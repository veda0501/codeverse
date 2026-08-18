import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AnalogyVisual from '../components/AnalogyVisual';
import { ArrowRight, Star, HelpCircle, Code, ShieldCheck } from 'lucide-react';

export default function Home() {
  const { user } = useContext(AuthContext);
  const [selectedAnalogy, setSelectedAnalogy] = useState('variables');

  const featuredLanguages = [
    { name: 'Python', badge: 'λ', desc: 'High-level dynamic typing with rapid development. Preferred for ML, data science, and backend systems.', color: 'var(--primary)' },
    { name: 'JavaScript', badge: 'JS', desc: 'Event-driven runtime for DOM manipulation and async I/O. Powers modern frontend and Node.js backends.', color: 'var(--accent)' },
    { name: 'C Language', badge: 'C', desc: 'Low-level systems programming. Direct memory access and performance-critical applications.', color: 'var(--secondary)' },
    { name: 'C++', badge: 'C++', desc: 'Object-oriented extension of C. Used in competitive programming, game engines, and embedded systems.', color: 'var(--success)' }
  ];

  const analogies = [
    { id: 'variables', label: 'Variables (Jar)', desc: 'Think of variables as jars with sticky labels.' },
    { id: 'loops', label: 'Loops (Hamster)', desc: 'Loops repeat actions just like a hamster wheel.' },
    { id: 'conditionals', label: 'Conditionals (Gates)', desc: 'Decisions branch code down paths like railway switches.' },
    { id: 'pointers', label: 'Pointers (Houses)', desc: 'Pointers store location addresses like a street map.' }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section glass-card">
        <div className="hero-text-content">
          <span className="hero-badge">LEARN TO CODE</span>
          <h1 className="hero-title">
            Master Programming <span className="gradient-text">Fundamentals</span>
          </h1>
          <p className="hero-subtitle">
            Structured curriculum covering algorithms, data structures, and language paradigms.
            From syntax fundamentals to software architecture — built for students and developers.
          </p>
          <div className="hero-cta-group">
            {user ? (
              <Link to="/courses" className="btn btn-primary">
                <span>Go to Courses</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary">
                  <span>Start Learning Free</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  <span>Log In</span>
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-visual">
          <div className="glow-sphere pulse-glow"></div>
          <span className="hero-mascot">🧙‍♂️</span>
        </div>
      </section>

      {/* Core Concepts Explained */}
      <section className="analogy-spotlight-section">
        <div className="section-header">
          <HelpCircle className="glow-text-secondary" />
          <h2>Concepts with Implementation</h2>
          <p>Interactive demonstrations showing core programming concepts alongside executable code.</p>
        </div>

        <div className="analogy-interactive-demo">
          <div className="analogy-tabs">
            {analogies.map(a => (
              <button 
                key={a.id} 
                className={`analogy-tab-btn ${selectedAnalogy === a.id ? 'active' : ''}`}
                onClick={() => setSelectedAnalogy(a.id)}
              >
                <span>{a.label}</span>
              </button>
            ))}
          </div>
          <div className="analogy-visual-wrapper">
            <AnalogyVisual type={selectedAnalogy} />
          </div>
        </div>
      </section>

      {/* Featured Languages */}
      <section className="featured-languages-section">
        <div className="section-header">
          <Code className="glow-text-primary" />
          <h2>Community & Progress</h2>
          <p>Track your learning with a structured achievement system and peer leaderboard.</p>
        </div>
        <div className="languages-grid">
          {featuredLanguages.map(lang => (
            <div key={lang.name} className="lang-card glass-card">
              <span className="lang-card-icon">{lang.icon}</span>
              <h3>{lang.name}</h3>
              <p>{lang.desc}</p>
              <Link to="/courses" className="lang-card-link">
                <span>View Syllabus</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="testimonials-section">
        <div className="section-header">
          <ShieldCheck className="glow-text-secondary" />
          <h2>Trusted by Developers</h2>
          <p>Success stories from students transitioning to programming careers.</p>
        </div>
        <div className="testimonials-grid">
          <div className="test-card glass-card">
            <div className="code-snippet">
              <code>{`for i in range(10):\n    print(f"Step {i}")`}</code>
            </div>
            <p className="test-quote">"The step-by-step breakdown of control flow made loops click. Landed my first junior dev role 3 months later."</p>
            <div className="student-profile">
              <div className="avatar">👨‍💻</div>
              <div>
                <h4>Alex Chen</h4>
                <span>Junior Backend Developer</span>
              </div>
            </div>
          </div>

          <div className="test-card glass-card">
            <div className="code-snippet">
              <code>const arr = [1, 2, 3];</code><br/><code>arr.map(x =&gt; x * 2)</code>
            </div>
            <p className="test-quote">"JavaScript fundamentals were confusing until the functional programming module. Now I understand closures and higher-order functions."</p>
            <div className="student-profile">
              <div className="avatar">👩‍💼</div>
              <div>
                <h4>Sarah M.</h4>
                <span>Frontend Engineer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .home-container {
          display: flex;
          flex-direction: column;
          gap: 4rem;
        }

        .hero-section {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 2rem;
          padding: 3rem;
          align-items: center;
          background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.15) 0%, rgba(18, 19, 26, 0.7) 100%);
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .hero-section {
            grid-template-columns: 1fr;
            padding: 1.5rem;
            text-align: center;
          }
        }

        .hero-badge {
          display: inline-block;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--primary);
          background: var(--primary-glow);
          padding: 0.4rem 1rem;
          border-radius: 99px;
          border: 1px solid var(--primary);
          margin-bottom: 1.5rem;
        }

        .hero-title {
          font-size: 3rem;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }

        .hero-subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          max-width: 550px;
        }

        .hero-cta-group {
          display: flex;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .hero-cta-group {
            justify-content: center;
          }
        }

        .hero-visual {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .glow-sphere {
          position: absolute;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, var(--secondary) 0%, transparent 70%);
          border-radius: 50%;
          z-index: 1;
        }

        .hero-mascot {
          font-size: 8rem;
          z-index: 2;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
          animation: float 4s ease-in-out infinite;
        }

        .section-header {
          text-align: center;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .section-header h2 {
          font-size: 2rem;
          color: var(--text-primary);
        }

        .section-header p {
          color: var(--text-secondary);
          font-size: 0.95rem;
          max-width: 500px;
        }

        /* Analogy Interactive Demo styling */
        .analogy-interactive-demo {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .analogy-interactive-demo {
            grid-template-columns: 1fr;
          }
        }

        .analogy-tabs {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        @media (max-width: 768px) {
          .analogy-tabs {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 0.5rem;
          }
        }

        .analogy-tab-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 1rem;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-weight: 700;
          cursor: pointer;
          text-align: left;
          transition: var(--transition-smooth);
        }

        .analogy-tab-btn.active, .analogy-tab-btn:hover {
          background: var(--primary-glow);
          border-color: var(--primary);
          color: var(--text-primary);
          box-shadow: 0 0 10px var(--primary-glow);
        }

        /* Languages Grid styling */
        .languages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
        }

        .lang-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2rem;
        }

        .lang-card-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          animation: float 5s ease-in-out infinite;
        }

        .lang-card h3 {
          margin-bottom: 0.5rem;
        }

        .lang-card p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          flex-grow: 1;
        }

        .lang-card-link {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--primary);
          font-weight: 700;
          font-size: 0.85rem;
        }

        .lang-card-link:hover {
          text-decoration: underline;
        }

        /* Testimonials */
        .testimonials-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .testimonials-grid {
            grid-template-columns: 1fr;
          }
        }

        .test-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .rating {
          display: flex;
          gap: 0.25rem;
        }

        .test-quote {
          font-style: italic;
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .student-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: auto;
        }

        .student-profile .avatar {
          font-size: 2rem;
          width: 44px;
          height: 44px;
          background: var(--bg-tertiary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color);
        }

        .student-profile h4 {
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .student-profile span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
