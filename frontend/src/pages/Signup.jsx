import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function Signup() {
  const { register, error, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/courses');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setLoading(true);
    const success = await register(name, email, password);
    setLoading(false);
    
    if (success) {
      navigate('/courses');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-box glass-card animate-float">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Start your coding journey with stories, analogies, and quizzes today.</p>
        </div>

        {error && (
          <div className="auth-error-alert">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="name">Your Name</label>
            <input
              type="text"
              id="name"
              className="input-control"
              placeholder="Alex Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="input-control"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="input-control"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>

        <p className="auth-redirect">
          Already have an account? <Link to="/login" className="gradient-text font-bold">Sign in</Link>
        </p>
      </div>

      <style>{`
        .auth-page-container {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .auth-box {
          width: 100%;
          max-width: 420px;
          background: var(--bg-secondary);
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .auth-header {
          text-align: center;
        }

        .auth-header h2 {
          font-size: 1.6rem;
          margin-bottom: 0.5rem;
        }

        .auth-header p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
        }

        .auth-error-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid var(--danger);
          color: var(--danger);
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
        }

        .auth-redirect {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .font-bold {
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
