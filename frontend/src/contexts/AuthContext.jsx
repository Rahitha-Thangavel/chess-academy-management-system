/**
 * Frontend module: frontend/src/contexts/AuthContext.jsx.
 * 
 * Part of the chess academy management system UI.
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { authStorage } from '../utils/authStorage';

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
      authStorage.migrateFromLocalStorage();
      const token = authStorage.getAccessToken();
      const storedUser = authStorage.getUser();

      if (token && storedUser) {
        try {
          // Verify token is valid by getting profile
          const profile = await authAPI.getProfile();

          // The profile endpoint returns the UserProfile data (which includes role fields)
          // We need to ensure the role matched what we expect.
          // Profile serializer in backend returns 'role' from 'user.role'

          const localUser = JSON.parse(storedUser);

          if (profile.role && profile.role !== localUser.role) {
            console.warn(`Role mismatch detected on refresh! Server: ${profile.role}, Local: ${localUser.role}`);
            const updatedUser = { ...localUser, ...profile };
            authStorage.setSession({ user: updatedUser });
            setUser(updatedUser);
          } else {
            setUser({ ...localUser, ...profile });
          }
        } catch (err) {
          console.error('Auth check failed:', err);
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            authStorage.clearSession();
            setUser(null);
          } else {
            try {
              const fallbackUser = JSON.parse(storedUser);
              setUser(fallbackUser);
            } catch (e) {
              authStorage.clearSession();
              setUser(null);
            }
          }
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

      authStorage.setSession({
        access: data.access,
        refresh: data.refresh,
        user: data.user,
      });

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
        authStorage.setSession({
          access: tokens.access,
          refresh: tokens.refresh,
          user: data.user,
        });
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
      authStorage.setSession({ user: updatedUser });
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
