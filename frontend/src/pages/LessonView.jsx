import React, { useContext, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CourseContext } from '../context/CourseContext';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CodePlayground from '../components/CodePlayground';
import AnalogyVisual from '../components/AnalogyVisual';
import { ArrowLeft, ArrowRight, Check, Compass, BookOpen, MessageCircle } from 'lucide-react';

export default function LessonView() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { fetchCourseDetails, completeLesson, progressList } = useContext(CourseContext);
  const { user } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [nextLessonId, setNextLessonId] = useState(null);

  useEffect(() => {
    const loadLessonDetails = async () => {
      setLoading(true);
      setIsSuccess(false);
      const details = await fetchCourseDetails(courseId);
      if (details) {
        setCourse(details);
        // Find lesson
        let foundLesson = null;
        let flatLessons = [];
        
        details.weeks.forEach(w => {
          w.lessons.forEach(l => {
            flatLessons.push(l);
            if (l.id === lessonId) {
              foundLesson = l;
            }
          });
        });

        setLesson(foundLesson);

        // Find next lesson
        if (foundLesson) {
          const currentIdx = flatLessons.findIndex(l => l.id === lessonId);
          if (currentIdx !== -1 && currentIdx < flatLessons.length - 1) {
            setNextLessonId(flatLessons[currentIdx + 1].id);
          } else {
            setNextLessonId(null);
          }
        }
      }
      setLoading(false);
    };

    loadLessonDetails();
  }, [courseId, lessonId]);

  // Check if already completed on load
  useEffect(() => {
    if (progressList && lessonId) {
      const progress = progressList.find(p => p.courseId === courseId);
      if (progress && progress.completedLessons.includes(lessonId)) {
        setIsSuccess(true);
      }
    }
  }, [progressList, lessonId, courseId]);

  const handleTaskSuccess = async () => {
    setIsSuccess(true);
    if (user) {
      await completeLesson(courseId, lessonId);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading lesson content...</div>;
  }

  if (!lesson) {
    return (
      <div className="lesson-page">
        <Navbar title="Lesson Not Found" />
        <div className="glass-card text-center" style={{ padding: '3rem' }}>
          <h3>Oops! That lesson doesn't exist.</h3>
          <Link to={`/courses/${courseId}`} className="btn btn-primary" style={{ marginTop: '1rem' }}>Return to Syllabus</Link>
        </div>
      </div>
    );
  }

  // Determine analogy type based on lesson contents
  const getAnalogyType = () => {
    const titleLower = lesson.title.toLowerCase();
    if (titleLower.includes('variable') || titleLower.includes('jar')) return 'variables';
    if (titleLower.includes('loop') || titleLower.includes('wheel') || titleLower.includes('count')) return 'loops';
    if (titleLower.includes('decision') || titleLower.includes('conditional') || titleLower.includes('light') || titleLower.includes('fork') || titleLower.includes('if')) return 'conditionals';
    if (titleLower.includes('pointer') || titleLower.includes('address') || titleLower.includes('street')) return 'pointers';
    return 'variables'; // default fallback
  };

  return (
    <div className="lesson-page-container">
      <div className="lesson-nav-header">
        <Link to={`/courses/${courseId}`} className="back-link">
          <ArrowLeft size={16} />
          <span>Syllabus Map</span>
        </Link>
        <span className="course-breadcrumb">{course.name}</span>
      </div>

      <div className="lesson-workspace">
        {/* Left Column: Lesson Explanations & Metaphors */}
        <div className="lesson-lecture-column">
          <div className="lecture-card glass-card">
            <div className="lecture-header">
              <BookOpen size={20} className="glow-text-primary" />
              <h3>{lesson.title}</h3>
            </div>
            
            <div className="lecture-body">
              <p className="main-content-p">{lesson.content}</p>

              {/* Story/Analogy Showcase Box */}
              <div className="analogy-story-box">
                <div className="story-header">
                  <Compass size={16} color="var(--secondary)" />
                  <h4>Visual Analogy: {lesson.analogyTitle}</h4>
                </div>
                <p>{lesson.analogyText}</p>
              </div>

              {/* Render Interactive Analogy visual element */}
              <div className="embedded-analogy">
                <AnalogyVisual type={getAnalogyType()} />
              </div>
            </div>

            {/* Congrats proceed banner */}
            {isSuccess && (
              <div className="congrats-panel glass-card">
                <div className="congrats-header">
                  <span className="success-icon-check">✓</span>
                  <div>
                    <h4>Lesson Completed!</h4>
                    <p>You've successfully finished the coding task.</p>
                  </div>
                </div>
                <div className="congrats-actions">
                  {nextLessonId ? (
                    <button 
                      onClick={() => navigate(`/courses/${courseId}/lessons/${nextLessonId}`)} 
                      className="btn btn-primary"
                    >
                      <span>Next Lesson</span>
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <Link to={`/courses/${courseId}`} className="btn btn-primary">
                      <span>Return to Syllabus</span>
                      <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor Playground */}
        <div className="lesson-coding-column">
          <CodePlayground
            lessonId={lesson.id}
            languageId={courseId === 'cpp' ? 'cpp' : courseId === 'c' ? 'c' : courseId === 'javascript' ? 'javascript' : 'python'}
            defaultCode={lesson.defaultCode || lesson.codeExample}
            codeExample={lesson.codeExample}
            practiceTask={lesson.practiceTask}
            practiceHint={lesson.practiceHint}
            expectedOutput={lesson.expectedOutput}
            onTaskSuccess={handleTaskSuccess}
          />
        </div>
      </div>

      <style>{`
        .lesson-page-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 1280px;
          margin: 0 auto;
        }

        .lesson-nav-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.9rem;
          transition: var(--transition-smooth);
        }

        .back-link:hover {
          color: var(--text-primary);
        }

        .course-breadcrumb {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
        }

        .lesson-workspace {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 992px) {
          .lesson-workspace {
            grid-template-columns: 1fr;
          }
        }

        .lesson-lecture-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .lecture-card {
          background: var(--bg-secondary);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .lecture-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1rem;
        }

        .lecture-header h3 {
          font-size: 1.35rem;
          color: var(--text-primary);
        }

        .lecture-body {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .main-content-p {
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--text-primary);
        }

        .analogy-story-box {
          background: rgba(168, 85, 247, 0.05);
          border-left: 4px solid var(--secondary);
          padding: 1.25rem;
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
        }

        .story-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .story-header h4 {
          font-size: 0.95rem;
          color: var(--secondary);
        }

        .analogy-story-box p {
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--text-secondary);
          font-style: italic;
        }

        .embedded-analogy {
          margin-top: 0.5rem;
        }

        /* Congratulations Proceed panel */
        .congrats-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(99, 102, 241, 0.02) 100%);
          border-color: var(--success);
          padding: 1.25rem;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .congrats-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .success-icon-check {
          background: var(--success);
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 1.2rem;
          box-shadow: 0 0 10px var(--success-glow);
        }

        .congrats-header h4 {
          color: var(--success);
          font-size: 1.1rem;
        }

        .congrats-header p {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
