import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CourseContext } from '../context/CourseContext';
import Navbar from '../components/Navbar';
import Certificate from '../components/Certificate';
import { Flame, Award, Shield, CheckSquare, Sparkles, BookOpen, GraduationCap, X, Target, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { progressList, courses } = useContext(CourseContext);
  const [showCert, setShowCert] = useState(false);
  const [selectedCourseCert, setSelectedCourseCert] = useState(null);
  const canvasRef = useRef(null);

  // Weekly XP Goal state (persisted in localStorage)
  const [weeklyGoal, setWeeklyGoal] = useState(() => parseInt(localStorage.getItem('cv_weekly_goal') || '200', 10));
  const [editGoal, setEditGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(weeklyGoal);

  // Expanded badge schema — 10 badges
  const badgeSchema = [
    { id: 'first_program', name: 'First Program', desc: 'Ran your first code in the playground.', icon: '🐍' },
    { id: 'quiz_master', name: 'Quiz Master', desc: 'Achieved a perfect 100% score on a quiz.', icon: '🏆' },
    { id: 'debugging_expert', name: 'Debugging Expert', desc: 'Solved a debugging challenge.', icon: '🔍' },
    { id: 'project_complete', name: 'Project Master', desc: 'Completed a Week 3 mini-project.', icon: '🎓' },
    { id: 'course_starter', name: 'Course Starter', desc: 'Completed your very first lesson.', icon: '🚀' },
    { id: 'speed_learner', name: 'Speed Learner', desc: 'Finished 3+ lessons in one session.', icon: '⚡' },
    { id: '7_day_streak', name: '7-Day Streak', desc: 'Maintained a 7-day learning streak.', icon: '🔥' },
    { id: '10_day_streak', name: '10-Day Streak', desc: 'Maintained a 10-day learning streak.', icon: '💎' },
    { id: 'xp_100', name: 'Century Club', desc: 'Earned 100+ total XP.', icon: '💯' },
    { id: 'xp_500', name: 'XP Legend', desc: 'Earned 500+ total XP.', icon: '🌟' },
  ];

  // Fetch completed courses list
  const completedCourses = progressList.filter(p => p.completionPercent === 100);
  const inProgressCourses = progressList.filter(p => p.completionPercent > 0 && p.completionPercent < 100);

  // Calculate stats
  const totalLessonsDone = progressList.reduce((acc, curr) => acc + curr.completedLessons.length, 0);
  const totalQuizzesDone = progressList.reduce((acc, curr) => acc + Object.keys(curr.quizScores).length, 0);

  // Level logic (100 XP per level)
  const userLevel = Math.floor(user?.xp / 100) + 1;
  const xpInCurrentLevel = user?.xp % 100;

  // Weekly XP estimate — approximate from total XP as current week portion
  // Treat last 200 XP earned as "this week" for demo purposes
  const weeklyXP = Math.min(user?.xp || 0, 200);
  const weeklyProgress = Math.min(Math.round((weeklyXP / weeklyGoal) * 100), 100);

  const saveGoal = () => {
    const val = Math.max(10, parseInt(goalInput, 10) || 200);
    setWeeklyGoal(val);
    localStorage.setItem('cv_weekly_goal', String(val));
    setEditGoal(false);
  };

  // Draw Line Graph for XP progression
  useEffect(() => {
    if (!canvasRef.current || !user) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, 300, 150);
    const xpHistory = [0, 20, 50, 50, 110, 180, user.xp];
    const width = 300;
    const height = 150;
    const padding = 20;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const y = padding + ((height - padding * 2) / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#00c8e8';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const points = xpHistory.map((val, idx) => {
      const x = padding + ((width - padding * 2) / (xpHistory.length - 1)) * idx;
      const maxVal = Math.max(...xpHistory, 10);
      const y = height - padding - ((val / maxVal) * (height - padding * 2));
      return { x, y };
    });

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(0, 200, 232, 0.28)');
    grad.addColorStop(1, 'rgba(0, 200, 232, 0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding);
    for (let i = 0; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.closePath();
    ctx.fill();

    points.forEach((pt) => {
      ctx.fillStyle = '#7ab3d0';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [user]);

  const handleOpenCert = (courseProg) => {
    const courseDetails = courses.find(c => c.id === courseProg.courseId);
    setSelectedCourseCert({
      name: courseDetails ? courseDetails.name : courseProg.courseId.toUpperCase(),
      progress: courseProg
    });
    setShowCert(true);
  };

  return (
    <div className="dashboard-page">
      <Navbar title="My Progress Control Room" />

      {/* Header Profile Panel */}
      <section className="profile-header-panel glass-card animate-float">
        <div className="profile-badge-avatar">
          {user?.avatarEmoji || user?.name.charAt(0).toUpperCase()}
        </div>
        <div className="profile-title-details">
          <span className="rank-badge gradient-bg">
            {user?.xp < 100 ? 'Code Novice' : user?.xp < 300 ? 'Syntax Apprentice' : user?.xp < 600 ? 'Logic Specialist' : 'Syntax Sorcerer'}
          </span>
          <h1>Welcome Back, {user?.name}!</h1>
          <p>Level {userLevel} Developer</p>
        </div>

        {/* Level Progression meter */}
        <div className="level-prog-meter">
          <div className="level-prog-label">
            <span>Next Level</span>
            <span>{xpInCurrentLevel}/100 XP</span>
          </div>
          <div className="progress-track" style={{ height: '12px' }}>
            <div className="progress-bar-fill" style={{ width: `${xpInCurrentLevel}%` }}></div>
          </div>
        </div>
      </section>

      {/* Stats Cards grid */}
      <section className="stats-dashboard-grid">
        <div className="stat-card glass-card">
          <Flame className="stat-icon icon-streak" size={24} fill="#f59e0b" color="#f59e0b" />
          <div className="stat-card-details">
            <h3>{user?.streakCount} Days</h3>
            <p>Learning Streak</p>
          </div>
        </div>
        <div className="stat-card glass-card">
          <Sparkles className="stat-icon icon-xp" size={24} color="#7ab3d0" />
          <div className="stat-card-details">
            <h3>{user?.xp} XP</h3>
            <p>Total Experience</p>
          </div>
        </div>
        <div className="stat-card glass-card">
          <CheckSquare className="stat-icon icon-lesson" size={24} color="#10b981" />
          <div className="stat-card-details">
            <h3>{totalLessonsDone}</h3>
            <p>Lessons Read</p>
          </div>
        </div>
        <div className="stat-card glass-card">
          <Award className="stat-icon icon-quiz" size={24} color="#00c8e8" />
          <div className="stat-card-details">
            <h3>{totalQuizzesDone}</h3>
            <p>Quizzes Completed</p>
          </div>
        </div>
      </section>

      {/* Courses In Progress Section */}
      {inProgressCourses.length > 0 && (
        <section className="in-progress-section">
          <div className="section-title">
            <TrendingUp size={18} className="glow-text-primary" />
            <h3>Courses In Progress</h3>
          </div>
          <div className="in-progress-grid">
            {inProgressCourses.map(p => {
              const course = courses.find(c => c.id === p.courseId);
              return (
                <Link key={p.courseId} to={`/courses/${p.courseId}`} className="progress-course-card glass-card">
                  <div className="pc-card-top">
                    <span className="pc-icon">{course?.icon || '📚'}</span>
                    <div className="pc-info">
                      <h4>{course?.name || p.courseId}</h4>
                      <span className="pc-lessons">{p.completedLessons.length} lessons done</span>
                    </div>
                    <span className="pc-pct">{p.completionPercent}%</span>
                  </div>
                  <div className="progress-track" style={{ height: '6px', marginTop: '0.75rem' }}>
                    <div className="progress-bar-fill" style={{ width: `${p.completionPercent}%` }}></div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="dashboard-double-columns">
        {/* Badges Grid (Left Column) */}
        <div className="double-col-left">
          <div className="section-title">
            <Shield className="glow-text-secondary" size={18} />
            <h3>My Unlocked Badges</h3>
            <span className="badge-count-pill">{(user?.badges || []).length}/{badgeSchema.length}</span>
          </div>

          <div className="badges-display-grid">
            {badgeSchema.map(b => {
              const unlocked = user?.badges.includes(b.id);
              return (
                <div key={b.id} className={`badge-item ${unlocked ? 'unlocked' : 'locked'}`}>
                  <span className="badge-icon">{b.icon}</span>
                  <div className="badge-name">{b.name}</div>
                  <div className="badge-desc">{b.desc}</div>
                  {!unlocked && <span className="locked-shield">🔒 Locked</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts and Certificates (Right Column) */}
        <div className="double-col-right">
          {/* Weekly XP Goal Widget */}
          <div className="weekly-goal-card glass-card">
            <div className="section-title">
              <Target size={16} className="glow-text-primary" />
              <h3>Weekly XP Goal</h3>
              <button className="goal-edit-btn" onClick={() => setEditGoal(e => !e)}>
                {editGoal ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editGoal ? (
              <div className="goal-edit-row">
                <input
                  type="number"
                  className="input-control"
                  value={goalInput}
                  min={10}
                  max={5000}
                  onChange={e => setGoalInput(e.target.value)}
                  style={{ maxWidth: '120px', padding: '0.4rem 0.6rem' }}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>XP target</span>
                <button className="btn btn-primary btn-sm" onClick={saveGoal} style={{ padding: '0.4rem 0.9rem' }}>Save</button>
              </div>
            ) : (
              <>
                <div className="goal-ring-row">
                  <div className="goal-ring-wrapper">
                    <svg viewBox="0 0 80 80" className="goal-ring-svg">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
                      <circle
                        cx="40" cy="40" r="32" fill="none"
                        stroke="url(#goalGrad)" strokeWidth="8"
                        strokeDasharray={`${weeklyProgress * 2.01} 201`}
                        strokeLinecap="round"
                        transform="rotate(-90 40 40)"
                      />
                      <defs>
                        <linearGradient id="goalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="var(--primary)" />
                          <stop offset="100%" stopColor="var(--secondary)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="goal-ring-label">
                      <span className="goal-pct">{weeklyProgress}%</span>
                    </div>
                  </div>
                  <div className="goal-text-col">
                    <p className="goal-stat-line"><strong>{weeklyXP}</strong> / {weeklyGoal} XP</p>
                    <p className="goal-stat-sub">this week</p>
                    {weeklyProgress >= 100
                      ? <span className="goal-complete-badge">🎉 Goal Achieved!</span>
                      : <span className="goal-remain">{weeklyGoal - weeklyXP} XP remaining</span>
                    }
                  </div>
                </div>
              </>
            )}
          </div>

          {/* XP Progress chart */}
          <div className="dashboard-chart-card glass-card">
            <div className="section-title">
              <Sparkles size={16} className="glow-text-primary" />
              <h3>XP Learning Curve</h3>
            </div>
            <div className="chart-canvas-wrapper">
              <canvas ref={canvasRef} width="300" height="150" className="canvas-xp-chart"></canvas>
            </div>
          </div>

          {/* Certificates Vault */}
          <div className="cert-vault-card glass-card">
            <div className="section-title">
              <GraduationCap size={18} className="glow-text-secondary" />
              <h3>Certificates Vault</h3>
            </div>
            {completedCourses.length === 0 ? (
              <p className="no-cert-p">No certificates unlocked yet. Reach 100% completion in any course syllabus to generate one!</p>
            ) : (
              <div className="cert-items-list">
                {completedCourses.map(p => (
                  <div key={p.courseId} className="cert-vault-row">
                    <div className="cert-row-details">
                      <span className="cert-row-logo">🎓</span>
                      <div>
                        <h4>{courses.find(c => c.id === p.courseId)?.name || p.courseId.toUpperCase()}</h4>
                        <span className="cert-code">{p.certificateId}</span>
                      </div>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleOpenCert(p)}>
                      View/Print
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCert && user && selectedCourseCert && (
        <div className="modal-overlay">
          <div className="modal-content-cert glass-card">
            <button className="modal-close" onClick={() => setShowCert(false)}>
              <X size={24} />
            </button>
            <Certificate 
              userName={user.name} 
              courseName={selectedCourseCert.name} 
              certificateId={selectedCourseCert.progress.certificateId} 
              completionDate={new Date()}
            />
          </div>
        </div>
      )}

      <style>{`
        .dashboard-page {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .profile-header-panel {
          display: grid;
          grid-template-columns: auto 1fr 250px;
          gap: 2rem;
          padding: 2.5rem;
          align-items: center;
          background: linear-gradient(135deg, rgba(0, 200, 232, 0.08) 0%, rgba(122, 179, 208, 0.04) 100%);
        }

        @media (max-width: 768px) {
          .profile-header-panel {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 1.5rem;
          }
        }

        .profile-badge-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          font-size: 2.5rem;
          font-family: var(--font-display);
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px var(--primary-glow);
          margin: 0 auto;
        }

        .profile-title-details h1 {
          font-size: 1.5rem;
          margin-top: 0.5rem;
        }

        .rank-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          color: white;
          padding: 0.2rem 0.6rem;
          border-radius: 99px;
          text-transform: uppercase;
        }

        .level-prog-meter {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        /* Stats Cards dashboard */
        .stats-dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem;
          background: var(--bg-secondary);
        }

        .stat-icon {
          padding: 0.5rem;
          border-radius: 12px;
          background: var(--primary-glow);
        }

        .icon-streak { background: rgba(245, 158, 11, 0.08); }
        .icon-xp { background: rgba(122, 179, 208, 0.12); }
        .icon-lesson { background: var(--success-glow); }
        .icon-quiz { background: var(--accent-glow); }

        .stat-card-details h3 {
          font-family: var(--font-display);
          font-size: 1.35rem;
          color: var(--text-primary);
        }

        .stat-card-details p {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }

        /* In Progress Section */
        .in-progress-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .in-progress-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1rem;
        }

        .progress-course-card {
          display: flex;
          flex-direction: column;
          padding: 1.25rem;
          background: var(--bg-secondary);
          text-decoration: none;
          transition: var(--transition-smooth);
        }

        .progress-course-card:hover {
          transform: translateY(-3px);
          border-color: var(--primary);
        }

        .pc-card-top {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .pc-icon { font-size: 1.75rem; }

        .pc-info {
          flex: 1;
          min-width: 0;
        }

        .pc-info h4 {
          font-size: 0.9rem;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pc-lessons {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .pc-pct {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--primary);
        }

        /* Double layout columns */
        .dashboard-double-columns {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 2rem;
          align-items: start;
        }

        @media (max-width: 768px) {
          .dashboard-double-columns {
            grid-template-columns: 1fr;
          }
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .section-title h3 {
          font-size: 1.1rem;
          color: var(--text-primary);
          flex: 1;
        }

        .badge-count-pill {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 99px;
          background: var(--primary-glow);
          color: var(--primary);
          border: 1px solid var(--border-color);
        }

        /* Badges grid — 10 badges in 2 cols */
        .badges-display-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }

        @media (max-width: 480px) {
          .badges-display-grid { grid-template-columns: 1fr; }
        }

        .badge-item.locked { opacity: 0.45; }

        .locked-shield {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 0.5rem;
          font-weight: 700;
        }

        /* Weekly Goal Widget */
        .weekly-goal-card {
          padding: 1.25rem;
          background: var(--bg-secondary);
          margin-bottom: 1.5rem;
        }

        .goal-edit-btn {
          background: none;
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.15rem 0.5rem;
          border-radius: 99px;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .goal-edit-btn:hover { color: var(--primary); border-color: var(--primary); }

        .goal-edit-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-top: 0.25rem;
        }

        .goal-ring-row {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .goal-ring-wrapper {
          position: relative;
          width: 80px;
          height: 80px;
          flex-shrink: 0;
        }

        .goal-ring-svg {
          width: 80px;
          height: 80px;
          transform: scale(1);
        }

        .goal-ring-label {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .goal-pct {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.05rem;
          color: var(--primary);
        }

        .goal-text-col {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .goal-stat-line {
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .goal-stat-line strong {
          color: var(--primary);
          font-family: var(--font-display);
        }

        .goal-stat-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .goal-complete-badge {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--success);
          background: var(--success-glow);
          padding: 0.2rem 0.5rem;
          border-radius: 99px;
        }

        .goal-remain {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Chart card */
        .dashboard-chart-card {
          padding: 1.25rem;
          background: var(--bg-secondary);
          margin-bottom: 1.5rem;
        }

        .chart-canvas-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0.5rem 0;
        }

        .canvas-xp-chart {
          width: 100% !important;
          max-width: 350px;
          height: auto !important;
        }

        /* Certificates Vault */
        .cert-vault-card {
          padding: 1.25rem;
          background: var(--bg-secondary);
        }

        .no-cert-p {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-style: italic;
          line-height: 1.5;
        }

        .cert-items-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .cert-vault-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
        }

        .cert-row-details {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .cert-row-logo { font-size: 1.5rem; }

        .cert-row-details h4 {
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .cert-code {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          z-index: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .modal-content-cert {
          position: relative;
          max-width: 750px;
          width: 100%;
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: var(--transition-smooth);
        }

        .modal-close:hover { color: var(--danger); border-color: var(--danger); }

        .level-prog-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .double-col-right {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
