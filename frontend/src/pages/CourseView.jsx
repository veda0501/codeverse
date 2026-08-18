import React, { useContext, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CourseContext } from '../context/CourseContext';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Certificate from '../components/Certificate';
import { 
  CheckCircle, 
  Lock, 
  Play, 
  HelpCircle, 
  Briefcase, 
  ChevronRight, 
  BookOpen, 
  Sparkles, 
  Trophy, 
  Award,
  X
} from 'lucide-react';

export default function CourseView() {
  const { courseId } = useParams();
  const { fetchCourseDetails, progressList } = useContext(CourseContext);
  const { user } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [courseProgress, setCourseProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCert, setShowCert] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      const details = await fetchCourseDetails(courseId);
      setCourse(details);
      setLoading(false);
    };
    loadDetails();
  }, [courseId]);

  useEffect(() => {
    if (progressList && courseId) {
      const progress = progressList.find(p => p.courseId === courseId);
      setCourseProgress(progress || null);
    }
  }, [progressList, courseId]);

  if (loading) {
    return <div className="loading-spinner">Loading syllabus details...</div>;
  }

  if (!course) {
    return (
      <div className="courses-page">
        <Navbar title="Course Not Found" />
        <div className="glass-card text-center" style={{ padding: '3rem' }}>
          <h3>Oops! That course doesn't exist yet.</h3>
          <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Course Library</Link>
        </div>
      </div>
    );
  }

  // Check if a lesson is unlocked
  // Logic: Unlocked if it is the first lesson, OR the previous lesson is completed, OR the user is not logged in (preview mode)
  const isLessonUnlocked = (weekIdx, lessonIdx) => {
    if (!user) return true; // Preview mode
    if (!courseProgress) return weekIdx === 0 && lessonIdx === 0;
    
    // Find absolute position of this lesson
    let flatLessons = [];
    course.weeks.forEach(w => {
      w.lessons.forEach(l => {
        flatLessons.push(l.id);
      });
    });

    const targetLessonId = course.weeks[weekIdx].lessons[lessonIdx].id;
    const targetIdx = flatLessons.indexOf(targetLessonId);

    if (targetIdx === 0) return true; // First lesson is always unlocked

    // Unlocked if the immediately preceding lesson is completed
    const prevLessonId = flatLessons[targetIdx - 1];
    return courseProgress.completedLessons.includes(prevLessonId);
  };

  // Check if quiz is unlocked
  // Quiz is unlocked if all lessons in the course (or at least Week 3) are completed
  const isQuizUnlocked = () => {
    if (!user) return true;
    if (!courseProgress) return false;
    
    let allLessonIds = [];
    course.weeks.forEach(w => {
      w.lessons.forEach(l => {
        allLessonIds.push(l.id);
      });
    });

    return allLessonIds.every(id => courseProgress.completedLessons.includes(id));
  };

  // Check if project is unlocked
  const isProjectUnlocked = () => {
    return isQuizUnlocked();
  };

  const isCompleted = (lessonId) => {
    return courseProgress?.completedLessons.includes(lessonId) || false;
  };

  const hasQuizScore = (quizId) => {
    return courseProgress?.quizScores && courseProgress.quizScores[quizId] !== undefined;
  };

  const isProjectCompleted = (projId) => {
    return courseProgress?.completedProjects?.includes(projId) || false;
  };

  return (
    <div className="course-view-page">
      <Navbar title={course.name} />

      {/* Graduation Banner if 100% completed */}
      {courseProgress?.completionPercent === 100 && (
        <div className="graduation-banner glass-card animate-float">
          <div className="grad-text-content">
            <Award className="icon-gold animate-pulse" size={32} />
            <div>
              <h3>Congratulations, Graduate!</h3>
              <p>You completed 100% of this course. Click the button to view and download your certificate.</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCert(true)}>
            <span>View Certificate</span>
          </button>
        </div>
      )}

      {/* Course Overview Block */}
      <section className="course-overview-card glass-card">
        <div className="overview-header">
          <span className="overview-icon">{course.icon}</span>
          <div>
            <h1>Syllabus Roadmap</h1>
            <p>{course.description}</p>
          </div>
        </div>

        <div className="overview-stats">
          <div className="overview-stat-item">
            <Trophy size={20} className="glow-text-primary" />
            <div>
              <div className="stat-num">{course.xp} XP</div>
              <div className="stat-lbl">Course Value</div>
            </div>
          </div>
          <div className="overview-stat-item">
            <BookOpen size={20} className="glow-text-secondary" />
            <div>
              <div className="stat-num">{course.weeks.length} Weeks</div>
              <div className="stat-lbl">Duration</div>
            </div>
          </div>
          {user && courseProgress && (
            <div className="overview-stat-item completion-box">
              <div className="completion-ring">
                <span className="ring-text">{courseProgress.completionPercent}%</span>
              </div>
              <div>
                <div className="stat-num">Completed</div>
                <div className="stat-lbl">Your Progress</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Week Timeline */}
      <section className="timeline-section">
        {course.weeks.map((week, wIdx) => (
          <div key={week.weekNumber} className="timeline-week-block">
            <div className="week-header-node">
              <h3>Week {week.weekNumber}: {week.title}</h3>
            </div>

            <div className="timeline-nodes-list">
              {/* Lessons list */}
              {week.lessons.map((lesson, lIdx) => {
                const unlocked = isLessonUnlocked(wIdx, lIdx);
                const completed = isCompleted(lesson.id);

                return (
                  <div key={lesson.id} className={`timeline-node ${completed ? 'completed' : ''} ${!unlocked ? 'locked' : ''}`}>
                    <div className="node-icon">
                      {completed ? (
                        <CheckCircle size={20} color="var(--success)" fill="var(--success-glow)" />
                      ) : !unlocked ? (
                        <Lock size={18} color="var(--text-muted)" />
                      ) : (
                        <Play size={18} color="var(--primary)" />
                      )}
                    </div>
                    <div className="node-details">
                      <div className="node-title-row">
                        <h4>{lesson.title}</h4>
                        {completed && <span className="completed-badge">Done (+10 XP)</span>}
                        {unlocked && !completed && <span className="unlocked-badge">Active</span>}
                      </div>
                      <p className="analogy-preview">
                        <strong>Analogy:</strong> {lesson.analogyTitle} — {lesson.analogyText.slice(0, 100)}...
                      </p>
                      
                      <div className="node-actions">
                        {unlocked ? (
                          <Link to={`/courses/${courseId}/lessons/${lesson.id}`} className="btn btn-secondary btn-sm">
                            <span>{completed ? 'Review Lesson' : 'Start Lesson'}</span>
                            <ChevronRight size={14} />
                          </Link>
                        ) : (
                          <button className="btn btn-ghost btn-sm" disabled>
                            <Lock size={12} />
                            <span>Locked</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Quiz Node (placed at the end of Week 3 / final week) */}
              {wIdx === course.weeks.length - 1 && week.quiz && (
                <div className={`timeline-node quiz-node ${hasQuizScore(week.quiz.id) ? 'completed' : ''} ${!isQuizUnlocked() ? 'locked' : ''}`}>
                  <div className="node-icon">
                    {hasQuizScore(week.quiz.id) ? (
                      <CheckCircle size={20} color="var(--success)" fill="var(--success-glow)" />
                    ) : !isQuizUnlocked() ? (
                      <Lock size={18} color="var(--text-muted)" />
                    ) : (
                      <HelpCircle size={20} color="var(--secondary)" />
                    )}
                  </div>
                  <div className="node-details">
                    <div className="node-title-row">
                      <h4>{week.quiz.title}</h4>
                      {hasQuizScore(week.quiz.id) && (
                        <span className="completed-badge font-success">
                          Passed ({courseProgress.quizScores[week.quiz.id]} Correct)
                        </span>
                      )}
                    </div>
                    <p className="analogy-preview">Test your understanding with debugging and prediction questions (+50 XP).</p>
                    <div className="node-actions">
                      {isQuizUnlocked() ? (
                        <Link to={`/courses/${courseId}/quiz`} className="btn btn-primary btn-sm">
                          <span>{hasQuizScore(week.quiz.id) ? 'Retake Quiz' : 'Take Quiz'}</span>
                          <ChevronRight size={14} />
                        </Link>
                      ) : (
                        <button className="btn btn-ghost btn-sm" disabled>
                          <Lock size={12} />
                          <span>Complete all lessons to unlock</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Mini Project Node (placed at the end of Week 3) */}
              {wIdx === course.weeks.length - 1 && (
                <div className={`timeline-node project-node ${isProjectCompleted('week3_project') ? 'completed' : ''} ${!isProjectUnlocked() ? 'locked' : ''}`}>
                  <div className="node-icon">
                    {isProjectCompleted('week3_project') ? (
                      <CheckCircle size={20} color="var(--success)" fill="var(--success-glow)" />
                    ) : !isProjectUnlocked() ? (
                      <Lock size={18} color="var(--text-muted)" />
                    ) : (
                      <Briefcase size={20} color="var(--accent)" />
                    )}
                  </div>
                  <div className="node-details">
                    <div className="node-title-row">
                      <h4>Week 3 Mini Project Challenge</h4>
                      {isProjectCompleted('week3_project') && (
                        <span className="completed-badge project-completed">Completed (+100 XP)</span>
                      )}
                    </div>
                    <p className="analogy-preview">Build a real working project combining everything you've learned. You will write code in the playground to earn the Project Badge.</p>
                    <div className="node-actions">
                      {isProjectUnlocked() ? (
                        <Link to={`/courses/${courseId}/lessons/${course.weeks[wIdx].lessons[course.weeks[wIdx].lessons.length - 1].id}`} className="btn btn-secondary btn-sm">
                          <span>{isProjectCompleted('week3_project') ? 'Review Project' : 'Build Project'}</span>
                          <ChevronRight size={14} />
                        </Link>
                      ) : (
                        <button className="btn btn-ghost btn-sm" disabled>
                          <Lock size={12} />
                          <span>Complete all lessons to unlock</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        ))}
      </section>

      {/* Certificate Modal */}
      {showCert && user && courseProgress && (
        <div className="modal-overlay">
          <div className="modal-content-cert glass-card">
            <button className="modal-close" onClick={() => setShowCert(false)}>
              <X size={24} />
            </button>
            <Certificate 
              userName={user.name} 
              courseName={course.name} 
              certificateId={courseProgress.certificateId} 
              completionDate={new Date()}
            />
          </div>
        </div>
      )}

      <style>{`
        .course-view-page {
          max-width: 850px;
          margin: 0 auto;
        }

        .graduation-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, rgba(217, 119, 6, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%);
          border-color: #d97706;
          padding: 1.5rem;
          margin-bottom: 2rem;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .grad-text-content {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .icon-gold {
          color: #d97706;
        }

        .graduation-banner h3 {
          color: #d97706;
          font-size: 1.2rem;
        }

        .graduation-banner p {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .course-overview-card {
          padding: 2rem;
          margin-bottom: 3rem;
          background: var(--bg-secondary);
        }

        .overview-header {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .overview-icon {
          font-size: 3rem;
        }

        .overview-header h1 {
          font-size: 1.8rem;
          color: var(--text-primary);
        }

        .overview-header p {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .overview-stats {
          display: flex;
          gap: 3rem;
          flex-wrap: wrap;
          padding-top: 1.25rem;
          border-top: 1px solid var(--border-color);
        }

        .overview-stat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .stat-num {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-lbl {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }

        .completion-box {
          margin-left: auto;
        }

        @media (max-width: 600px) {
          .completion-box {
            margin-left: 0;
          }
        }

        .completion-ring {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 3.5px solid var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px var(--primary-glow);
        }

        .ring-text {
          font-size: 0.75rem;
          font-weight: 800;
          font-family: var(--font-display);
        }

        /* Timeline styles */
        .timeline-section {
          display: flex;
          flex-direction: column;
          gap: 3rem;
          margin-bottom: 4rem;
        }

        .timeline-week-block {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .week-header-node {
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--border-color);
        }

        .week-header-node h3 {
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .timeline-nodes-list {
          position: relative;
          padding-left: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .timeline-nodes-list::before {
          content: '';
          position: absolute;
          left: 4px;
          top: 8px;
          bottom: 8px;
          width: 2px;
          background: var(--border-color);
        }

        .timeline-node {
          position: relative;
          display: flex;
          gap: 1.25rem;
        }

        .node-icon {
          position: absolute;
          left: -32px;
          top: 2px;
          width: 22px;
          height: 22px;
          background: var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .node-details {
          flex: 1;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          transition: var(--transition-smooth);
        }

        .timeline-node:not(.locked) .node-details:hover {
          border-color: rgba(99, 102, 241, 0.3);
          background: rgba(255, 255, 255, 0.01);
          transform: translateX(4px);
        }

        .timeline-node.locked .node-details {
          opacity: 0.55;
        }

        .node-title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }

        .node-title-row h4 {
          font-size: 1rem;
          font-family: var(--font-sans);
          color: var(--text-primary);
        }

        .completed-badge {
          font-size: 0.7rem;
          background: var(--success-glow);
          color: var(--success);
          padding: 0.1rem 0.5rem;
          border-radius: 4px;
          font-weight: 700;
        }

        .unlocked-badge {
          font-size: 0.7rem;
          background: var(--primary-glow);
          color: var(--primary);
          padding: 0.1rem 0.5rem;
          border-radius: 4px;
          font-weight: 700;
        }

        .project-completed {
          background: var(--accent-glow);
          color: var(--accent);
        }

        .analogy-preview {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .node-actions {
          display: flex;
        }

        .btn-sm {
          padding: 0.4rem 1rem;
          font-size: 0.8rem;
          border-radius: var(--radius-sm);
        }

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .modal-content-cert {
          position: relative;
          background: #ffffff !important;
          max-height: 90vh;
          overflow-y: auto;
          padding: 2.5rem 1.5rem 1.5rem 1.5rem !important;
          width: 100%;
          max-width: 900px;
          border-radius: var(--radius-md);
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1.25rem;
          background: #f1f5f9;
          border: none;
          color: #334155;
          cursor: pointer;
          padding: 0.3rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .modal-close:hover {
          background: #e2e8f0;
        }
      `}</style>
    </div>
  );
}
