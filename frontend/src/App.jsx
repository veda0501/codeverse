import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CourseProvider, CourseContext } from './context/CourseContext';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CourseView from './pages/CourseView';
import LessonView from './pages/LessonView';
import QuizView from './pages/QuizView';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';

// Protected Route helper to gate access to personal profiles and quizzes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="loading-spinner">Loading authentication...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Global Floating notifications overlay (badge announcements / XP indicators)
const NotificationToast = () => {
  const { notification } = useContext(CourseContext);
  
  if (!notification) return null;

  return (
    <div className={`notification-toast animate-float ${notification.type}`}>
      <span className="toast-logo">✨</span>
      <span className="toast-text">{notification.message}</span>
    </div>
  );
};

function AppContent() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="full-page-loading">
        <div className="spinner"></div>
        <p>Initializing CodeVerse Core System...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main View Panel */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:courseId" element={<CourseView />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          
          {/* Protected Routes */}
          <Route 
            path="/courses/:courseId/lessons/:lessonId" 
            element={
              <ProtectedRoute>
                <LessonView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/courses/:courseId/quiz" 
            element={
              <ProtectedRoute>
                <QuizView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Dynamic Toast overlay */}
      <NotificationToast />

      <style>{`
        /* Global grid structural styles */
        .full-page-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          gap: 1rem;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4.5px solid var(--border-color);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Floating Notifications Toast */
        .notification-toast {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-radius: var(--radius-md);
          background: rgba(18, 19, 26, 0.95);
          backdrop-filter: blur(16px);
          border: 1px solid var(--primary);
          color: var(--text-primary);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px var(--primary-glow);
          z-index: 1000;
          max-width: 450px;
          animation-duration: 2s;
        }

        .notification-toast.error {
          border-color: var(--danger);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(239, 68, 68, 0.15);
        }

        .toast-logo {
          font-size: 1.25rem;
          animation: float 2s infinite;
        }

        .toast-text {
          font-size: 0.85rem;
          font-weight: 700;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CourseProvider>
          <AppContent />
        </CourseProvider>
      </AuthProvider>
    </Router>
  );
}
