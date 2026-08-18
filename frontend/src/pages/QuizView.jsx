import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CourseContext } from '../context/CourseContext';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { HelpCircle, CheckCircle2, XCircle, ChevronRight, Award, Trophy, RotateCcw } from 'lucide-react';

export default function QuizView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { fetchCourseDetails, submitQuiz } = useContext(CourseContext);
  const { user } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quiz running states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  
  // XP gained and badge status returned from submit API
  const [quizResults, setQuizResults] = useState(null);

  useEffect(() => {
    const loadQuiz = async () => {
      const details = await fetchCourseDetails(courseId);
      if (details) {
        setCourse(details);
        // Find the quiz. We'll check the last week (usually week 3)
        let foundQuiz = null;
        details.weeks.forEach(w => {
          if (w.quiz) {
            foundQuiz = w.quiz;
          }
        });
        setQuiz(foundQuiz);
      }
      setLoading(false);
    };
    loadQuiz();
  }, [courseId]);

  if (loading) {
    return <div className="loading-spinner">Loading quiz questions...</div>;
  }

  if (!quiz) {
    return (
      <div className="quiz-page">
        <Navbar title="Quiz Not Found" />
        <div className="glass-card text-center" style={{ padding: '3rem' }}>
          <h3>No quiz available for this course yet!</h3>
          <Link to={`/courses/${courseId}`} className="btn btn-primary" style={{ marginTop: '1rem' }}>Return to Syllabus</Link>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIdx];

  const handleOptionSelect = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    
    setIsAnswered(true);
    setShowExplanation(true);
    
    if (selectedOption === currentQuestion.answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = async () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setShowExplanation(false);

    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Quiz finished, save score
      setQuizFinished(true);
      if (user) {
        const results = await submitQuiz(courseId, quiz.id, score + (selectedOption === currentQuestion.answer ? 1 : 0), quiz.questions.length);
        setQuizResults(results);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowExplanation(false);
    setQuizFinished(false);
    setQuizResults(null);
  };

  return (
    <div className="quiz-page-container">
      <Navbar title={`${course.name} - Quiz`} />

      {!quizFinished ? (
        <div className="quiz-card glass-card">
          {/* Progress Header */}
          <div className="quiz-progress-header">
            <span>Question {currentIdx + 1} of {quiz.questions.length}</span>
            <div className="mini-progress-track">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${((currentIdx) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Text */}
          <div className="question-section">
            <h2 className="question-title">{currentQuestion.question.includes('```') ? currentQuestion.question.split('```')[0] : currentQuestion.question}</h2>
            
            {/* Syntax block for predictions / debugging */}
            {currentQuestion.question.includes('```') && (
              <pre className="quiz-code-block">
                <code>
                  {currentQuestion.question.split('```')[1]?.replace(/python|c|cpp|js/g, '')?.replace(/```/g, '')}
                </code>
              </pre>
            )}
          </div>

          {/* Options Grid */}
          <div className="options-grid">
            {currentQuestion.options.map((option, i) => {
              let optionClass = '';
              if (selectedOption === option) {
                optionClass = 'selected';
              }
              if (isAnswered) {
                if (option === currentQuestion.answer) {
                  optionClass = 'correct';
                } else if (selectedOption === option) {
                  optionClass = 'incorrect';
                } else {
                  optionClass = 'disabled';
                }
              }

              return (
                <button
                  key={i}
                  className={`option-btn ${optionClass}`}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isAnswered}
                >
                  <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                  <span className="option-text">{option}</span>
                  {isAnswered && option === currentQuestion.answer && <CheckCircle2 size={18} className="icon-feedback" />}
                  {isAnswered && selectedOption === option && option !== currentQuestion.answer && <XCircle size={18} className="icon-feedback" />}
                </button>
              );
            })}
          </div>

          {/* Submit / Next Buttons */}
          <div className="quiz-action-row">
            {!isAnswered ? (
              <button 
                className="btn btn-primary"
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
              >
                Submit Answer
              </button>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={handleNext}
              >
                <span>{currentIdx === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Explanation Text */}
          {showExplanation && (
            <div className={`explanation-box ${selectedOption === currentQuestion.answer ? 'exp-correct' : 'exp-incorrect'}`}>
              <h5>
                {selectedOption === currentQuestion.answer ? '🎉 Correct!' : '❌ That\'s not quite right.'}
              </h5>
              <p>{currentQuestion.explanation}</p>
            </div>
          )}
        </div>
      ) : (
        /* Finished Results Screen */
        <div className="results-card glass-card text-center animate-float">
          <div className="results-badge">
            <Trophy size={48} className="glow-text-secondary" />
          </div>
          <h2>Quiz Completed!</h2>
          <p className="results-score-p">
            You scored <strong className="gradient-text">{score} / {quiz.questions.length}</strong> correct answers.
          </p>

          {/* Rewards Section */}
          {user && quizResults && (
            <div className="rewards-panel glass-card">
              <h4>Rewards Earned</h4>
              <div className="reward-badge-list">
                <div className="reward-badge-item">
                  <span className="reward-icon">✨</span>
                  <span className="reward-label">+{quizResults.xpEarned} Experience Points</span>
                </div>
                {quizResults.badgeEarned && (
                  <div className="reward-badge-item badge-glow animate-pulse">
                    <Award size={24} color="#a855f7" />
                    <span className="reward-label">Unlocked: "Quiz Master" Badge! (+50 XP)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="results-actions">
            <button className="btn btn-secondary" onClick={handleRestart}>
              <RotateCcw size={16} />
              <span>Retake Quiz</span>
            </button>
            <Link to={`/courses/${courseId}`} className="btn btn-primary">
              Return to Syllabus
            </Link>
          </div>
        </div>
      )}

      <style>{`
        .quiz-page-container {
          max-width: 750px;
          margin: 0 auto;
        }

        .quiz-card, .results-card {
          padding: 2.5rem;
          background: var(--bg-secondary);
        }

        .quiz-progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .mini-progress-track {
          width: 150px;
          height: 6px;
          background: var(--bg-tertiary);
          border-radius: 3px;
          overflow: hidden;
        }

        .question-section {
          margin-bottom: 2rem;
        }

        .question-title {
          font-size: 1.35rem;
          line-height: 1.4;
          color: var(--text-primary);
        }

        .quiz-code-block {
          margin-top: 1rem;
          background: #090a0f;
          padding: 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          overflow-x: auto;
        }

        .quiz-code-block code {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: #f8f8f2;
          white-space: pre-wrap;
        }

        .options-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .option-btn {
          display: flex;
          align-items: center;
          padding: 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          text-align: left;
          transition: var(--transition-smooth);
          width: 100%;
        }

        .option-letter {
          background: rgba(255, 255, 255, 0.05);
          width: 26px;
          height: 26px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          margin-right: 1rem;
          color: var(--text-secondary);
          transition: var(--transition-smooth);
        }

        .option-text {
          flex: 1;
        }

        .icon-feedback {
          margin-left: 1rem;
        }

        /* Option states */
        .option-btn:hover:not(:disabled) {
          border-color: var(--primary);
          background: var(--primary-glow);
        }

        .option-btn.selected {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.2);
        }

        .option-btn.selected .option-letter {
          background: var(--primary);
          color: white;
        }

        .option-btn.correct {
          border-color: var(--success);
          background: rgba(16, 185, 129, 0.15);
        }

        .option-btn.correct .option-letter {
          background: var(--success);
          color: white;
        }

        .option-btn.incorrect {
          border-color: var(--danger);
          background: rgba(239, 68, 68, 0.12);
        }

        .option-btn.incorrect .option-letter {
          background: var(--danger);
          color: white;
        }

        .option-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quiz-action-row {
          display: flex;
          justify-content: flex-end;
        }

        /* Explanation Box */
        .explanation-box {
          margin-top: 1.5rem;
          padding: 1.25rem;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .explanation-box h5 {
          font-size: 0.95rem;
          margin-bottom: 0.4rem;
        }

        .exp-correct {
          background: rgba(16, 185, 129, 0.08);
          border-left: 4px solid var(--success);
          color: var(--text-primary);
        }

        .exp-incorrect {
          background: rgba(239, 68, 68, 0.06);
          border-left: 4px solid var(--danger);
          color: var(--text-primary);
        }

        /* Results Screen */
        .results-badge {
          margin-bottom: 1.5rem;
          animation: float 4s ease-in-out infinite;
        }

        .results-score-p {
          font-size: 1.2rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .rewards-panel {
          padding: 1.5rem;
          background: var(--bg-tertiary);
          margin-bottom: 2rem;
        }

        .rewards-panel h4 {
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .reward-badge-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: center;
        }

        .reward-badge-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .reward-icon {
          font-size: 1.5rem;
        }

        .badge-glow {
          color: var(--secondary);
          text-shadow: 0 0 10px var(--secondary-glow);
        }

        .results-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
}
