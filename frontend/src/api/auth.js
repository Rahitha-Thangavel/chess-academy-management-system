import axiosInstance from './axiosInstance';
import { authStorage } from '../utils/authStorage';

export const authAPI = {
  // Register user
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register/', userData);
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login/', {
      email,
      password,
    });
    return response.data;
  },

  // Logout user
  logout: async () => {
    const refreshToken = authStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await axiosInstance.post('/auth/logout/', { refresh: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    authStorage.clearSession();
  },

  // Get user profile
  getProfile: async () => {
    const response = await axiosInstance.get('/auth/profile/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await axiosInstance.put('/auth/profile/', userData);
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    const response = await axiosInstance.put('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    return response.data;
  },
};
