import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, KeyRound, Sparkles } from 'lucide-react';

export default function Login() {
  const { login, error, user, resetPassword, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Password reset simulation states
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetMessage, setResetMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      navigate('/courses');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (success) {
      navigate('/courses');
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    // Create or login standard demo account
    const demoEmail = 'guest@codeverse.com';
    const demoPass = 'guest123';

    // Attempt login
    let success = await login(demoEmail, demoPass);

    if (!success) {
      // If demo account doesn't exist, we'll suggest registering or we can register it in background.
      // For testing, registering guest account:
      try {
        const successReg = await register('Guest Explorer', demoEmail, demoPass);
        if (successReg) {
          success = true;
        }
      } catch (err) {
        console.error(err);
      }
    }

    setLoading(false);
    if (success) {
      navigate('/courses');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetNewPass) return;

    setLoading(true);
    const res = await resetPassword(resetEmail, resetNewPass);
    setLoading(false);

    if (res.success) {
      setResetMessage({ text: res.msg, type: 'success' });
      setEmail(resetEmail);
      setPassword(resetNewPass);
      setTimeout(() => {
        setShowReset(false);
        setResetMessage({ text: '', type: '' });
      }, 3000);
    } else {
      setResetMessage({ text: res.msg, type: 'error' });
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-box glass-card animate-float">

        {!showReset ? (
          /* LOGIN FORM */
          <>
            <div className="auth-header">
              <h2>Welcome to <span className="gradient-text">CodeVerse</span></h2>
              <p>Log in to access your dashboard, track streaks, and earn badges.</p>
            </div>

            {error && (
              <div className="auth-error-alert">
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                  <button type="button" className="btn-forgot-link" onClick={() => setShowReset(true)}>
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  id="password"
                  className="input-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>

            <p className="auth-redirect" style={{ marginTop: '1.5rem' }}>
              New to CodeVerse? <Link to="/signup" className="gradient-text font-bold">Create an account</Link>
            </p>
          </>
        ) : (
          /* PASSWORD RESET FORM */
          <>
            <div className="auth-header">
              <h2>Reset Password</h2>
              <p>Enter your email and choose a new password. The simulator will directly overwrite the database.</p>
            </div>

            {resetMessage.text && (
              <div className={`auth-error-alert ${resetMessage.type === 'success' ? 'bg-success-alert' : ''}`}>
                <KeyRound size={16} />
                <span>{resetMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="auth-form">
              <div className="input-group">
                <label htmlFor="reset-email">Email Address</label>
                <input
                  type="email"
                  id="reset-email"
                  className="input-control"
                  placeholder="name@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="reset-pass">New Password</label>
                <input
                  type="password"
                  id="reset-pass"
                  className="input-control"
                  placeholder="••••••••"
                  value={resetNewPass}
                  onChange={(e) => setResetNewPass(e.target.value)}
                  required
                />
              </div>

              <div className="reset-action-buttons">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReset(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  Reset Password
                </button>
              </div>
            </form>
          </>
        )}
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

        .bg-success-alert {
          background: var(--success-glow) !important;
          border-color: var(--success) !important;
          color: var(--success) !important;
        }

        .btn-forgot-link {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 0.75rem;
          cursor: pointer;
          font-weight: 600;
        }

        .btn-forgot-link:hover {
          text-decoration: underline;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 700;
        }

        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-color);
        }

        .auth-divider span {
          padding: 0 0.75rem;
        }

        .demo-bypass-btn {
          border-color: var(--primary);
          background: rgba(168, 85, 247, 0.05);
          color: var(--text-primary);
          animation-duration: 3s;
        }

        .demo-bypass-btn:hover {
          background: var(--primary-glow);
        }

        .auth-redirect {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .font-bold {
          font-weight: 700;
        }

        .reset-action-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}
