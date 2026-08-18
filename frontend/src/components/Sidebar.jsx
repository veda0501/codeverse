import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CourseContext } from '../context/CourseContext';
import { 
  Home, 
  LayoutDashboard, 
  BookOpen, 
  LogOut, 
  Sun, 
  Moon, 
  Flame, 
  Sparkles,
  Menu,
  X,
  Trophy,
  Settings,
  Bell,
  CheckCheck
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout, theme, toggleTheme } = useContext(AuthContext);
  const { appNotifications, clearAppNotifications } = useContext(CourseContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  // Track read notifications
  const [readCount, setReadCount] = useState(() => {
    return parseInt(localStorage.getItem('cv_notif_read') || '0', 10);
  });
  const unreadCount = Math.max(0, appNotifications.length - readCount);

  // Close bell dropdown on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleBellOpen = () => {
    setBellOpen(prev => !prev);
    // Mark all as read
    setReadCount(appNotifications.length);
    localStorage.setItem('cv_notif_read', String(appNotifications.length));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    ...(user ? [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }] : [])
  ];

  const timeAgo = (isoString) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="mobile-toggle-btn" onClick={toggleMobileMenu}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Layout */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Link to="/" onClick={() => setIsOpen(false)}>
            <span className="logo-icon">🚀</span>
            <span className="logo-text gradient-text">CodeVerse</span>
          </Link>
        </div>

        {/* User Stats Summary */}
        {user && (
          <div className="sidebar-stats glass-card">
            <div className="stat-row">
              <div className="stat-label">
                <Flame className="icon-streak" size={18} fill={theme === 'dark' ? '#f59e0b' : '#d97706'} color="#f59e0b" />
                <span>Streak</span>
              </div>
              <div className="stat-value">{user.streakCount} days</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">
                <Sparkles className="icon-xp" size={18} color="#7ab3d0" />
                <span>Total XP</span>
              </div>
              <div className="stat-value">{user.xp} XP</div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {/* Notification Bell */}
          {user && (
            <div className="bell-wrapper" ref={bellRef}>
              <button className="bell-btn" onClick={handleBellOpen} title="Notifications">
                <Bell size={18} />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {bellOpen && (
                <div className="bell-dropdown glass-card">
                  <div className="bell-dropdown-header">
                    <span>Recent Activity</span>
                    {appNotifications.length > 0 && (
                      <button className="bell-clear-btn" onClick={() => {
                        clearAppNotifications();
                        setReadCount(0);
                        localStorage.setItem('cv_notif_read', '0');
                      }}>
                        <CheckCheck size={14} /> Clear all
                      </button>
                    )}
                  </div>
                  {appNotifications.length === 0 ? (
                    <p className="bell-empty">No activity yet. Start learning!</p>
                  ) : (
                    <div className="bell-list">
                      {appNotifications.map(n => (
                        <div key={n.id} className={`bell-item ${n.type}`}>
                          <span className="bell-item-msg">{n.message}</span>
                          <span className="bell-item-time">{timeAgo(n.time)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle */}
          <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
            {theme === 'dark' ? (
              <>
                <Sun size={20} color="#f59e0b" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={20} color="#00c8e8" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {/* User Profile / Logout */}
          {user ? (
            <div className="user-profile-section">
              <div className="user-details">
                <div className="user-avatar">
                  {user.avatarEmoji || user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-title">
                    {user.xp < 100 ? 'Novice' : user.xp < 300 ? 'Apprentice' : user.xp < 600 ? 'Specialist' : 'Syntax Sorcerer'}
                  </div>
                </div>
              </div>
              <div className="user-action-row">
                <Link to="/settings" className="btn-settings" onClick={() => setIsOpen(false)} title="Settings">
                  <Settings size={15} />
                  <span>Settings</span>
                </Link>
                <button className="btn-logout" onClick={handleLogout}>
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons-sidebar">
              <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setIsOpen(false)}>
                Log In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* CSS overlay for mobile menu */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleMobileMenu}></div>}

      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 260px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          z-index: 100;
          transition: transform 0.3s ease;
        }

        .sidebar-logo {
          margin-bottom: 2rem;
        }

        .sidebar-logo a {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 800;
        }

        .logo-icon {
          font-size: 1.75rem;
        }

        .sidebar-stats {
          padding: 1rem;
          margin-bottom: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-md);
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
        }

        .stat-row:last-child {
          margin-bottom: 0;
        }

        .stat-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
        }

        .icon-streak {
          animation: float 2s ease-in-out infinite;
        }

        .icon-xp {
          animation: pulse-glow 2s infinite;
        }

        .stat-value {
          font-weight: 700;
          font-family: var(--font-display);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex-grow: 1;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-weight: 600;
          transition: var(--transition-smooth);
        }

        .nav-link:hover, .nav-link.active {
          color: var(--text-primary);
          background: var(--primary-glow);
        }

        .nav-link.active {
          border-left: 3px solid var(--primary);
        }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
        }

        /* Bell Notification */
        .bell-wrapper {
          position: relative;
        }

        .bell-btn {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-secondary);
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-weight: 600;
          width: 100%;
          text-align: left;
          border-radius: var(--radius-sm);
          transition: var(--transition-smooth);
          position: relative;
          font-size: 0.9rem;
        }

        .bell-btn:hover {
          background: var(--border-color);
          color: var(--text-primary);
        }

        .bell-badge {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: #070d18;
          font-size: 0.65rem;
          font-weight: 900;
          padding: 0.1rem 0.35rem;
          border-radius: 99px;
          min-width: 18px;
          text-align: center;
          animation: pulse-glow 2s infinite;
        }

        .bell-dropdown {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 0;
          right: 0;
          background: var(--bg-secondary) !important;
          border: 1px solid var(--border-color) !important;
          border-radius: var(--radius-md);
          padding: 0.75rem !important;
          z-index: 200;
          min-width: 240px;
          box-shadow: 0 -8px 32px rgba(0,0,0,0.4);
          animation: slideUp 0.2s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .bell-dropdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          text-transform: uppercase;
        }

        .bell-clear-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          transition: var(--transition-smooth);
        }

        .bell-clear-btn:hover { color: var(--danger); }

        .bell-empty {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-style: italic;
          text-align: center;
          padding: 0.5rem;
        }

        .bell-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 220px;
          overflow-y: auto;
        }

        .bell-item {
          padding: 0.5rem 0.6rem;
          border-radius: var(--radius-sm);
          border-left: 3px solid var(--primary);
          background: var(--primary-glow);
        }

        .bell-item.error {
          border-left-color: var(--danger);
          background: rgba(239, 68, 68, 0.06);
        }

        .bell-item-msg {
          display: block;
          font-size: 0.75rem;
          color: var(--text-primary);
          line-height: 1.4;
          margin-bottom: 0.2rem;
        }

        .bell-item-time {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .theme-toggle {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 1rem;
          color: var(--text-secondary);
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-weight: 600;
          width: 100%;
          text-align: left;
          border-radius: var(--radius-sm);
          transition: var(--transition-smooth);
        }

        .theme-toggle:hover {
          background: var(--border-color);
          color: var(--text-primary);
        }

        .user-profile-section {
          background: rgba(0, 0, 0, 0.15);
          padding: 0.75rem;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .user-details {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.1rem;
          box-shadow: 0 0 10px var(--primary-glow);
          flex-shrink: 0;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-title {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .user-action-row {
          display: flex;
          gap: 0.5rem;
        }

        .btn-settings {
          flex: 1;
          background: none;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          padding: 0.4rem 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 600;
          transition: var(--transition-smooth);
          text-decoration: none;
        }

        .btn-settings:hover {
          background: var(--border-color);
          color: var(--text-primary);
        }

        .btn-logout {
          flex: 1;
          background: none;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--danger);
          padding: 0.4rem 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 600;
          transition: var(--transition-smooth);
        }

        .btn-logout:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .mobile-toggle-btn {
          display: none;
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 110;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
        }

        @media (max-width: 992px) {
          .mobile-toggle-btn {
            display: block;
          }

          .sidebar {
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .sidebar-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            z-index: 99;
          }
        }
      `}</style>
    </>
  );
}
