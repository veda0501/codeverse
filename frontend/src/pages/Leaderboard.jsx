import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Trophy, Flame, Sparkles, Shield, Medal } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RANK_COLORS = {
  0: { bg: 'rgba(255, 215, 0, 0.12)', border: '#FFD700', text: '#FFD700', label: '🥇' },
  1: { bg: 'rgba(192, 192, 192, 0.1)', border: '#C0C0C0', text: '#C0C0C0', label: '🥈' },
  2: { bg: 'rgba(205, 127, 50, 0.1)', border: '#CD7F32', text: '#CD7F32', label: '🥉' },
};

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          setLeaders(data);
        } else {
          setError('Could not load leaderboard.');
        }
      } catch {
        setError('Server connection error.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const maxXP = leaders.length > 0 ? leaders[0].xp || 1 : 1;

  return (
    <div className="leaderboard-page">
      <Navbar title="Global Leaderboard" />

      {/* Hero Banner */}
      <header className="lb-hero glass-card">
        <Trophy size={36} className="lb-hero-icon" />
        <div>
          <h1>Hall of Fame</h1>
          <p>Top coders ranked by total XP earned. Keep learning to climb the ranks!</p>
        </div>
      </header>

      {loading ? (
        <div className="loading-spinner">Loading rankings...</div>
      ) : error ? (
        <div className="lb-error glass-card">{error}</div>
      ) : leaders.length === 0 ? (
        <div className="lb-empty glass-card">
          <Trophy size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p>No users yet. Be the first to join!</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {leaders.length >= 3 && (
            <div className="podium-row">
              {/* 2nd Place */}
              <div className="podium-item podium-2">
                <div className="podium-avatar" style={{ borderColor: '#C0C0C0', boxShadow: '0 0 16px rgba(192,192,192,0.3)' }}>
                  {leaders[1]?.avatarEmoji || leaders[1]?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="podium-medal">🥈</div>
                <div className="podium-name">{leaders[1]?.name}</div>
                <div className="podium-xp" style={{ color: '#C0C0C0' }}>{leaders[1]?.xp} XP</div>
                <div className="podium-block podium-block-2"></div>
              </div>

              {/* 1st Place */}
              <div className="podium-item podium-1">
                <div className="crown-wrap">👑</div>
                <div className="podium-avatar" style={{ borderColor: '#FFD700', boxShadow: '0 0 24px rgba(255,215,0,0.4)', width: '72px', height: '72px', fontSize: '1.8rem' }}>
                  {leaders[0]?.avatarEmoji || leaders[0]?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="podium-medal">🥇</div>
                <div className="podium-name" style={{ fontSize: '1.05rem', fontWeight: 900 }}>{leaders[0]?.name}</div>
                <div className="podium-xp" style={{ color: '#FFD700', fontSize: '1rem' }}>{leaders[0]?.xp} XP</div>
                <div className="podium-block podium-block-1"></div>
              </div>

              {/* 3rd Place */}
              <div className="podium-item podium-3">
                <div className="podium-avatar" style={{ borderColor: '#CD7F32', boxShadow: '0 0 16px rgba(205,127,50,0.3)' }}>
                  {leaders[2]?.avatarEmoji || leaders[2]?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="podium-medal">🥉</div>
                <div className="podium-name">{leaders[2]?.name}</div>
                <div className="podium-xp" style={{ color: '#CD7F32' }}>{leaders[2]?.xp} XP</div>
                <div className="podium-block podium-block-3"></div>
              </div>
            </div>
          )}

          {/* Full Rankings Table */}
          <div className="lb-table-section glass-card">
            <div className="lb-table-header">
              <div className="section-title" style={{ marginBottom: 0 }}>
                <Medal size={18} className="glow-text-secondary" />
                <h3>Full Rankings</h3>
              </div>
            </div>

            <div className="lb-rows">
              {leaders.map((u, idx) => {
                const rankStyle = RANK_COLORS[idx] || {};
                const xpPct = Math.round((u.xp / maxXP) * 100);
                return (
                  <div
                    key={u.id}
                    className="lb-row"
                    style={idx < 3 ? { background: rankStyle.bg, borderColor: rankStyle.border + '55' } : {}}
                  >
                    <div className="lb-rank" style={idx < 3 ? { color: rankStyle.text } : {}}>
                      {idx < 3 ? rankStyle.label : `#${idx + 1}`}
                    </div>

                    <div className="lb-avatar" style={idx < 3 ? { borderColor: rankStyle.border, boxShadow: `0 0 10px ${rankStyle.border}44` } : {}}>
                      {u.avatarEmoji || u.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <div className="lb-user-info">
                      <div className="lb-user-name">{u.name}</div>
                      <div className="lb-xp-bar-track">
                        <div className="lb-xp-bar-fill" style={{ width: `${xpPct}%`, background: idx < 3 ? rankStyle.text : 'linear-gradient(90deg, var(--primary), var(--secondary))' }}></div>
                      </div>
                    </div>

                    <div className="lb-stats-col">
                      <div className="lb-stat">
                        <Sparkles size={14} color="#7ab3d0" />
                        <span className="lb-xp-num" style={idx < 3 ? { color: rankStyle.text } : {}}>{u.xp} XP</span>
                      </div>
                      <div className="lb-stat">
                        <Flame size={14} color="#f59e0b" fill="#f59e0b" />
                        <span className="lb-streak">{u.streakCount}d</span>
                      </div>
                      <div className="lb-stat">
                        <Shield size={14} color="var(--primary)" />
                        <span className="lb-badges">{(u.badges || []).length}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <style>{`
        .leaderboard-page {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .lb-hero {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.06) 0%, rgba(0, 200, 232, 0.04) 100%);
          border-color: rgba(255, 215, 0, 0.15);
        }

        .lb-hero-icon {
          color: #FFD700;
          filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.5));
          flex-shrink: 0;
        }

        .lb-hero h1 { font-size: 1.75rem; margin-bottom: 0.25rem; }
        .lb-hero p { color: var(--text-secondary); font-size: 0.9rem; }

        .lb-error, .lb-empty {
          text-align: center;
          padding: 3rem;
          color: var(--text-secondary);
          background: var(--bg-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Podium */
        .podium-row {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 1rem;
          padding: 1rem 0;
        }

        .podium-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
        }

        .podium-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border: 3px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.4rem;
          color: white;
          transition: var(--transition-smooth);
        }

        .crown-wrap {
          font-size: 1.5rem;
          animation: float 2s ease-in-out infinite;
        }

        .podium-medal { font-size: 1.5rem; }

        .podium-name {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .podium-xp {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 0.85rem;
        }

        .podium-block {
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
          width: 120px;
          margin-top: 0.5rem;
        }

        .podium-block-1 {
          height: 80px;
          background: linear-gradient(180deg, rgba(255,215,0,0.25) 0%, rgba(255,215,0,0.05) 100%);
          border: 1px solid rgba(255,215,0,0.3);
        }

        .podium-block-2 {
          height: 56px;
          background: linear-gradient(180deg, rgba(192,192,192,0.2) 0%, rgba(192,192,192,0.04) 100%);
          border: 1px solid rgba(192,192,192,0.25);
        }

        .podium-block-3 {
          height: 40px;
          background: linear-gradient(180deg, rgba(205,127,50,0.2) 0%, rgba(205,127,50,0.04) 100%);
          border: 1px solid rgba(205,127,50,0.25);
        }

        /* Table */
        .lb-table-section {
          background: var(--bg-secondary);
          padding: 1.5rem;
        }

        .lb-table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .lb-rows {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .lb-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          transition: var(--transition-smooth);
        }

        .lb-row:hover {
          background: var(--primary-glow);
          border-color: var(--primary);
          transform: translateX(4px);
        }

        .lb-rank {
          font-family: var(--font-display);
          font-weight: 800;
          min-width: 36px;
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .lb-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1rem;
          color: white;
          flex-shrink: 0;
        }

        .lb-user-info {
          flex: 1;
          min-width: 0;
        }

        .lb-user-name {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-primary);
          margin-bottom: 0.3rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lb-xp-bar-track {
          height: 4px;
          background: var(--bg-tertiary);
          border-radius: 2px;
          overflow: hidden;
        }

        .lb-xp-bar-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.6s ease;
        }

        .lb-stats-col {
          display: flex;
          gap: 1rem;
          flex-shrink: 0;
        }

        .lb-stat {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .lb-xp-num {
          color: var(--primary);
          font-family: var(--font-display);
          font-weight: 700;
        }

        .lb-streak { color: #f59e0b; font-weight: 700; }
        .lb-badges { color: var(--primary); font-weight: 700; }

        @media (max-width: 600px) {
          .podium-row { gap: 0.5rem; }
          .podium-block { width: 80px; }
          .lb-stats-col { gap: 0.5rem; }
        }
      `}</style>
    </div>
  );
}
