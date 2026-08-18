import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { User, Palette, Shield, AlertTriangle, Check, Loader } from 'lucide-react';

const AVATAR_OPTIONS = ['🚀', '🦊', '🐉', '⚡', '🎯', '🦋', '🔮', '🌊', '🎮', '🛸'];

export default function Settings() {
  const { user, updateProfile, updateUserState } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [selectedEmoji, setSelectedEmoji] = useState(user?.avatarEmoji || null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [showDanger, setShowDanger] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg(null);
    const result = await updateProfile({
      name: name.trim() || user?.name,
      avatarEmoji: selectedEmoji
    });
    setSaving(false);
    if (result?.success) {
      setSaveMsg({ type: 'success', text: '✅ Profile updated successfully!' });
    } else {
      setSaveMsg({ type: 'error', text: result?.msg || 'Something went wrong.' });
    }
    setTimeout(() => setSaveMsg(null), 3500);
  };

  const handleClearProgress = () => {
    // Clear client-side notifications and localStorage artifacts
    localStorage.removeItem('cv_notifications');
    localStorage.removeItem('cv_notif_read');
    localStorage.removeItem('cv_weekly_goal');
    // Clear code history entries
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('cv_history_')) localStorage.removeItem(k);
    });
    setSaveMsg({ type: 'success', text: '🗑️ Local cache cleared. Reload to refresh.' });
    setShowDanger(false);
    setTimeout(() => setSaveMsg(null), 3500);
  };

  const userLevel = Math.floor((user?.xp || 0) / 100) + 1;
  const xpInCurrentLevel = (user?.xp || 0) % 100;

  return (
    <div className="settings-page">
      <Navbar title="Account Settings" />

      <div className="settings-grid">
        {/* Left: Profile Card */}
        <div className="settings-preview glass-card">
          <div className="preview-avatar-big">
            {selectedEmoji || user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <h2 className="preview-name">{name || user?.name}</h2>
          <span className="preview-rank gradient-bg">
            {(user?.xp || 0) < 100 ? 'Code Novice' : (user?.xp || 0) < 300 ? 'Syntax Apprentice' : (user?.xp || 0) < 600 ? 'Logic Specialist' : 'Syntax Sorcerer'}
          </span>
          <div className="preview-stats">
            <div className="preview-stat">
              <span className="ps-value">{user?.xp || 0}</span>
              <span className="ps-label">Total XP</span>
            </div>
            <div className="preview-stat">
              <span className="ps-value">{userLevel}</span>
              <span className="ps-label">Level</span>
            </div>
            <div className="preview-stat">
              <span className="ps-value">{(user?.badges || []).length}</span>
              <span className="ps-label">Badges</span>
            </div>
          </div>

          <div className="preview-xp-bar">
            <div className="preview-xp-label">
              <span>Level Progress</span>
              <span>{xpInCurrentLevel}/100 XP</span>
            </div>
            <div className="progress-track" style={{ height: '8px' }}>
              <div className="progress-bar-fill" style={{ width: `${xpInCurrentLevel}%` }}></div>
            </div>
          </div>
        </div>

        {/* Right: Settings Panels */}
        <div className="settings-panels">
          {/* Profile Section */}
          <div className="settings-panel glass-card">
            <div className="panel-header">
              <User size={18} className="glow-text-primary" />
              <h3>Profile Info</h3>
            </div>

            <div className="input-group">
              <label>Display Name</label>
              <input
                type="text"
                className="input-control"
                value={name}
                maxLength={30}
                onChange={e => setName(e.target.value)}
                placeholder="Your display name"
              />
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="text"
                className="input-control"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              />
              <span className="field-hint">Email cannot be changed</span>
            </div>
          </div>

          {/* Avatar Section */}
          <div className="settings-panel glass-card">
            <div className="panel-header">
              <Palette size={18} className="glow-text-secondary" />
              <h3>Avatar Emoji</h3>
            </div>
            <p className="panel-desc">Pick an emoji that represents you on the leaderboard and dashboard.</p>
            <div className="emoji-picker-grid">
              {AVATAR_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  className={`emoji-option ${selectedEmoji === emoji ? 'selected' : ''}`}
                  onClick={() => setSelectedEmoji(emoji === selectedEmoji ? null : emoji)}
                  title={`Select ${emoji}`}
                >
                  {emoji}
                  {selectedEmoji === emoji && <span className="emoji-check"><Check size={10} /></span>}
                </button>
              ))}
            </div>
            {selectedEmoji && (
              <button className="clear-emoji-btn" onClick={() => setSelectedEmoji(null)}>
                Use initials instead
              </button>
            )}
          </div>

          {/* Save Button + Message */}
          <div className="save-row">
            {saveMsg && (
              <div className={`save-msg ${saveMsg.type}`}>{saveMsg.text}</div>
            )}
            <button
              className="btn btn-primary"
              onClick={handleSaveProfile}
              disabled={saving}
              style={{ minWidth: '160px' }}
            >
              {saving ? <><Loader size={16} className="spin-icon" /> Saving...</> : <><Check size={16} /> Save Changes</>}
            </button>
          </div>

          {/* Danger Zone */}
          <div className="settings-panel danger-panel glass-card">
            <div className="panel-header">
              <AlertTriangle size={18} color="var(--danger)" />
              <h3 style={{ color: 'var(--danger)' }}>Danger Zone</h3>
            </div>
            <p className="panel-desc">Clearing local cache removes notification history, code history, and weekly goal settings stored in your browser. Your XP and course progress are not affected.</p>

            {!showDanger ? (
              <button className="btn btn-secondary" onClick={() => setShowDanger(true)} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                Clear Local Cache
              </button>
            ) : (
              <div className="danger-confirm">
                <span>Are you sure?</span>
                <button className="btn btn-secondary" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={handleClearProgress}>
                  Yes, Clear Cache
                </button>
                <button className="btn btn-ghost" onClick={() => setShowDanger(false)}>Cancel</button>
              </div>
            )}
          </div>

          {/* Badge Overview */}
          <div className="settings-panel glass-card">
            <div className="panel-header">
              <Shield size={18} className="glow-text-secondary" />
              <h3>Your Badges</h3>
            </div>
            <div className="badges-mini-row">
              {(user?.badges || []).length === 0 ? (
                <p className="no-badges-hint">No badges earned yet. Start learning to unlock them!</p>
              ) : (
                (user?.badges || []).map(b => (
                  <span key={b} className="badge-mini-pill">{b.replace(/_/g, ' ')}</span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .settings-page {
          max-width: 960px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 768px) {
          .settings-grid { grid-template-columns: 1fr; }
        }

        /* Preview Card */
        .settings-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, rgba(0, 200, 232, 0.06) 0%, rgba(122, 179, 208, 0.02) 100%);
          position: sticky;
          top: 1.5rem;
        }

        .preview-avatar-big {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.75rem;
          font-weight: 800;
          color: white;
          box-shadow: 0 0 30px var(--primary-glow);
          margin-bottom: 0.5rem;
          transition: var(--transition-smooth);
        }

        .preview-name {
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .preview-rank {
          font-size: 0.7rem;
          font-weight: 800;
          color: white;
          padding: 0.2rem 0.7rem;
          border-radius: 99px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .preview-stats {
          display: flex;
          gap: 1.5rem;
          margin-top: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          width: 100%;
          justify-content: center;
        }

        .preview-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.1rem;
        }

        .ps-value {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.1rem;
          color: var(--primary);
        }

        .ps-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }

        .preview-xp-bar {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .preview-xp-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        /* Right Panels */
        .settings-panels {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .settings-panel {
          background: var(--bg-secondary);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
        }

        .panel-header h3 {
          font-size: 1rem;
          color: var(--text-primary);
        }

        .panel-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .field-hint {
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
          display: block;
        }

        /* Emoji Picker */
        .emoji-picker-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.6rem;
        }

        .emoji-option {
          position: relative;
          font-size: 1.75rem;
          background: var(--bg-tertiary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.5rem;
          cursor: pointer;
          transition: var(--transition-smooth);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .emoji-option:hover {
          border-color: var(--primary);
          background: var(--primary-glow);
          transform: scale(1.08);
        }

        .emoji-option.selected {
          border-color: var(--primary);
          background: var(--primary-glow);
          box-shadow: 0 0 12px var(--primary-glow);
        }

        .emoji-check {
          position: absolute;
          bottom: 2px;
          right: 2px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .clear-emoji-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.78rem;
          text-decoration: underline;
          padding: 0;
          align-self: flex-start;
          transition: var(--transition-smooth);
        }

        .clear-emoji-btn:hover { color: var(--text-secondary); }

        /* Save Row */
        .save-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .save-msg {
          flex: 1;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.6rem 1rem;
          border-radius: var(--radius-sm);
        }

        .save-msg.success {
          background: var(--success-glow);
          color: var(--success);
          border: 1px solid var(--success);
        }

        .save-msg.error {
          background: rgba(239, 68, 68, 0.08);
          color: var(--danger);
          border: 1px solid var(--danger);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spin-icon { animation: spin 0.8s linear infinite; }

        /* Danger */
        .danger-panel {
          border-color: rgba(239, 68, 68, 0.2);
        }

        .danger-confirm {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        /* Badges mini */
        .badges-mini-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .badge-mini-pill {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 99px;
          background: var(--primary-glow);
          color: var(--primary);
          border: 1px solid var(--border-color);
          text-transform: capitalize;
        }

        .no-badges-hint {
          font-size: 0.82rem;
          color: var(--text-muted);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
