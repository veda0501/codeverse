import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CourseContext } from '../context/CourseContext';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Award, BookOpen, Clock, Compass, Search, X } from 'lucide-react';

export default function CourseList() {
  const { courses, progressList, loading } = useContext(CourseContext);
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');

  const getCourseProgress = (courseId) => {
    if (!user || !progressList) return null;
    const progress = progressList.find(p => p.courseId === courseId);
    return progress ? progress.completionPercent : 0;
  };

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="courses-page">
      <Navbar title="Structured Coding Paths" />

      <header className="courses-header glass-card">
        <Compass size={24} className="glow-text-primary" />
        <div>
          <h1>Choose Your Adventure</h1>
          <p>Each language is structured as a short, easy-to-follow module. Analogies, visual concepts, and mini-projects are included.</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="search-bar-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search courses by name or topic..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => setSearchQuery('')}>
            <X size={16} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-spinner">Loading courses...</div>
      ) : (
        <>
          {filteredCourses.length === 0 ? (
            <div className="no-results glass-card">
              <Search size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <p>No courses match <strong>"{searchQuery}"</strong>. Try a different search term.</p>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map(course => {
                const progress = getCourseProgress(course.id);
                return (
                  <div key={course.id} className="course-card glass-card">
                    <div className="course-card-top">
                      <span className="course-icon">{course.icon}</span>
                      <span className={`diff-badge ${course.difficulty.toLowerCase()}`}>
                        {course.difficulty}
                      </span>
                    </div>

                    <div className="course-card-info">
                      <h3>{course.name}</h3>
                      <p>{course.description}</p>
                    </div>

                    <div className="course-card-meta">
                      <div className="meta-item">
                        <Clock size={14} />
                        <span>{course.totalWeeks} Weeks</span>
                      </div>
                      <div className="meta-item">
                        <BookOpen size={14} />
                        <span>{course.totalLessons} Lessons</span>
                      </div>
                      <div className="meta-item text-xp-green">
                        <Award size={14} />
                        <span>{course.xp} XP</span>
                      </div>
                    </div>

                    {/* Progress bar if logged in */}
                    {user && progress !== null && (
                      <div className="course-progress-container">
                        <div className="progress-label">
                          <span>Course Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    )}

                    <div className="course-card-action">
                      {progress === 100 ? (
                        <Link to={`/courses/${course.id}`} className="btn btn-secondary w-full" style={{ width: '100%' }}>
                          🎓 Completed (Review)
                        </Link>
                      ) : progress > 0 ? (
                        <Link to={`/courses/${course.id}`} className="btn btn-primary w-full" style={{ width: '100%' }}>
                          Resume Course
                        </Link>
                      ) : (
                        <Link to={`/courses/${course.id}`} className="btn btn-primary w-full" style={{ width: '100%' }}>
                          Start Course
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <style>{`
        .courses-page {
          max-width: 1000px;
          margin: 0 auto;
        }

        .courses-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          margin-bottom: 2rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(18, 19, 26, 0.6) 100%);
        }

        .courses-header h1 {
          font-size: 1.75rem;
          margin-bottom: 0.25rem;
        }

        .courses-header p {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 1.5rem;
        }

        .course-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          height: 100%;
        }

        .course-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .course-icon {
          font-size: 2.5rem;
        }

        .diff-badge {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .diff-badge.beginner {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          border: 1px solid var(--success);
        }

        .diff-badge.intermediate {
          background: rgba(245, 158, 11, 0.1);
          color: var(--warning);
          border: 1px solid var(--warning);
        }

        .course-card-info h3 {
          font-size: 1.15rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .course-card-info p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.5;
        }

        .course-card-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-muted);
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          padding: 0.75rem 0;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .text-xp-green {
          color: var(--success);
          font-weight: bold;
        }

        .course-progress-container {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .course-card-action {
          margin-top: auto;
        }

        .loading-spinner {
          text-align: center;
          padding: 3rem;
          color: var(--text-secondary);
          font-style: italic;
        }

        /* Search Bar */
        .search-bar-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.8rem 2.75rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 0.95rem;
          transition: var(--transition-smooth);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-glow);
        }

        .search-clear {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: var(--transition-smooth);
        }

        .search-clear:hover { color: var(--text-primary); }

        .no-results {
          text-align: center;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: var(--text-secondary);
          background: var(--bg-secondary);
        }

        .no-results strong { color: var(--text-primary); }
      `}</style>
    </div>
  );
}
