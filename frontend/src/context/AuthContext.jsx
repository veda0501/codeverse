import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set theme from local storage or default to dark
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Fetch current user details if token is stored
  const loadUser = async (authToken) => {
    if (!authToken) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/auth/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        // Token invalid, clear it
        logout();
      }
    } catch (err) {
      console.error('Error loading user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser(token);
  }, [token]);

  // Register User
  const register = async (name, email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return true;
      } else {
        setError(data.msg || 'Registration failed');
        return false;
      }
    } catch (err) {
      setError('Server connection error');
      return false;
    }
  };

  // Login User
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return true;
      } else {
        setError(data.msg || 'Login failed');
        return false;
      }
    } catch (err) {
      setError('Server connection error');
      return false;
    }
  };

  // Reset Password
  const resetPassword = async (email, newPassword) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, msg: data.msg };
      } else {
        return { success: false, msg: data.msg || 'Reset password failed' };
      }
    } catch (err) {
      return { success: false, msg: 'Server connection error' };
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  // Direct manual update to state (e.g. after earning XP or Badges)
  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
  };

  // Update profile (name, avatarEmoji)
  const updateProfile = async (updates) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
        return { success: true };
      } else {
        setError(data.msg || 'Update failed');
        return { success: false, msg: data.msg };
      }
    } catch (err) {
      setError('Server connection error');
      return { success: false, msg: 'Server connection error' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        theme,
        register,
        login,
        resetPassword,
        logout,
        toggleTheme,
        updateUserState,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
