import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CourseContext = createContext();

const API_URL = 'http://localhost:5000/api';

export const CourseProvider = ({ children }) => {
  const { token, updateUserState } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressList, setProgressList] = useState([]);
  const [notification, setNotification] = useState(null);
  const [appNotifications, setAppNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cv_notifications') || '[]'); } catch { return []; }
  });

  // Trigger floating notifications
  const triggerNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
    // Also persist to bell notification center (max 10 entries)
    const newEntry = { id: Date.now(), message, type, time: new Date().toISOString() };
    setAppNotifications(prev => {
      const updated = [newEntry, ...prev].slice(0, 10);
      localStorage.setItem('cv_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAppNotifications = () => {
    setAppNotifications([]);
    localStorage.removeItem('cv_notifications');
  };

  // Fetch all courses summaries
  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_URL}/courses`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch progress list for current user
  const fetchProgress = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProgressList(data);
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  };

  // Fetch full details of a course by ID
  const fetchCourseDetails = async (courseId) => {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (err) {
      console.error('Error fetching course details:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (token) {
      fetchProgress();
    } else {
      setProgressList([]);
    }
  }, [token]);

  // Complete a lesson
  const completeLesson = async (courseId, lessonId) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/progress/${courseId}/lessons/${lessonId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (response.ok) {
        // Update user state (XP, streaks, etc.)
        updateUserState(data.user);

        // Update local progress list
        setProgressList(prev => {
          const index = prev.findIndex(p => p.courseId === courseId);
          if (index === -1) {
            return [...prev, data.progress];
          }
          const copy = [...prev];
          copy[index] = data.progress;
          return copy;
        });

        if (data.certUnlocked) {
          triggerNotification('🏆 Congratulations! You have fully completed the course and unlocked your Certificate!', 'success');
        } else if (data.xpEarned > 0) {
          triggerNotification(`✨ Lesson completed! +${data.xpEarned} XP`, 'success');
        }

        return data.progress;
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
    }
    return null;
  };

  // Submit quiz score
  const submitQuiz = async (courseId, quizId, score, totalQuestions) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/progress/${courseId}/quiz`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ score, totalQuestions, quizId })
      });
      const data = await response.json();

      if (response.ok) {
        updateUserState(data.user);

        setProgressList(prev => {
          const index = prev.findIndex(p => p.courseId === courseId);
          if (index === -1) return [...prev, data.progress];
          const copy = [...prev];
          copy[index] = data.progress;
          return copy;
        });

        if (data.badgeEarned) {
          triggerNotification(`🏆 ${data.msg}`, 'success');
        } else {
          triggerNotification(`📝 Quiz completed! Earned +${data.xpEarned} XP (Score: ${score}/${totalQuestions})`, 'success');
        }

        return { progress: data.progress, badgeEarned: data.badgeEarned, xpEarned: data.xpEarned };
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
    }
    return null;
  };

  // Submit project completion
  const submitProject = async (courseId, projectId) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/progress/${courseId}/project`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectId })
      });
      const data = await response.json();

      if (response.ok) {
        updateUserState(data.user);

        setProgressList(prev => {
          const index = prev.findIndex(p => p.courseId === courseId);
          if (index === -1) return [...prev, data.progress];
          const copy = [...prev];
          copy[index] = data.progress;
          return copy;
        });

        triggerNotification(`🎓 Project Completed! +${data.xpEarned} XP. Badge unlocked!`, 'success');
        return { progress: data.progress, badgeEarned: data.badgeEarned };
      }
    } catch (err) {
      console.error('Error submitting project:', err);
    }
    return null;
  };

  // Trigger run code execution event (for First Program badge checks)
  const logCodeRun = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/progress/run-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        updateUserState(data.user);
        if (data.badgeEarned) {
          triggerNotification(`🎉 ${data.msg}`, 'success');
        }
      }
    } catch (err) {
      console.error('Error logging code run:', err);
    }
  };

  // Submit debug challenge completion
  const submitDebugChallenge = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/progress/debug-challenge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        updateUserState(data.user);
        triggerNotification(`🔍 ${data.msg}`, 'success');
      }
    } catch (err) {
      console.error('Error submitting debug challenge:', err);
    }
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        loading,
        progressList,
        notification,
        appNotifications,
        clearAppNotifications,
        fetchCourseDetails,
        completeLesson,
        submitQuiz,
        submitProject,
        logCodeRun,
        submitDebugChallenge,
        refreshProgress: fetchProgress
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};
