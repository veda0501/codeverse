import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Trophy } from 'lucide-react';

export default function Navbar({ title = "CodeVerse" }) {
  const { user } = useContext(AuthContext);

  return (
    <div className="navbar glass-card">
      <div className="navbar-title">
        <h2>{title}</h2>
      </div>

      {user && (
        <div className="navbar-stats-pill">
          <Trophy size={16} color="var(--primary)" fill="var(--primary)" />
          <span className="stat-label">Rep</span>
          <span className="stat-value">{user.xp}</span>
        </div>
      )}

      <style>{`
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          border-radius: var(--radius-md);
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          width: 100%;
        }

        .navbar-title h2 {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .navbar-stats-pill {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(0, 200, 232, 0.08);
          border: 1px solid var(--primary);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-family: var(--font-mono);
        }

        .stat-label {
          color: var(--text-secondary);
          font-weight: 600;
        }

        .stat-value {
          color: var(--primary);
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        @media (max-width: 992px) {
          .navbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 90;
            border-radius: 0;
            border-top: none;
            border-left: none;
            border-right: none;
            margin-bottom: 0;
            padding-left: 4.5rem; /* Space for sidebar mobile toggle button */
          }
        }
      `}</style>
    </div>
  );
}
