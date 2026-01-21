import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token is valid by getting profile
          const profile = await authAPI.getProfile();
          setUser(profile);
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const data = await authAPI.login(email, password);

      // Store tokens and user data
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMsg);
      // Return full data for handling specific cases like email verification
      return { success: false, error: errorMsg, data: err.response?.data };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const data = await authAPI.register(userData);

      // Check for tokens or just success message
      const tokens = data.tokens || (data.access ? data : null);

      if (tokens) {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }

      return { success: true, ...data };
    } catch (err) {
      const errorMsg = err.response?.data || 'Registration failed. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Logout function
  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    window.location.href = '/login';
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      const updatedUser = await authAPI.updateProfile(userData);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMsg = err.response?.data || 'Profile update failed.';
      return { success: false, error: errorMsg };
    }
  };

  // Change password function
  const changePassword = async (oldPassword, newPassword, confirmPassword) => {
    try {
      await authAPI.changePassword(oldPassword, newPassword, confirmPassword);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Password change failed.';
      return { success: false, error: errorMsg };
    }
  };

  // Check user role
  const isAdmin = () => user?.role === 'ADMIN';
  const isClerk = () => user?.role === 'CLERK';
  const isCoach = () => user?.role === 'COACH';
  const isParent = () => user?.role === 'PARENT';

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAdmin,
    isClerk,
    isCoach,
    isParent,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};