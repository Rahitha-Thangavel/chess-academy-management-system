import axios from 'axios';
import { authStorage } from '../utils/authStorage';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    authStorage.migrateFromLocalStorage();
    const token = authStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried refreshing yet
    // AND the request was not a login/register attempt (which should handle 401 naturally)
    const isAuthRequest = originalRequest.url.includes('/login') ||
      originalRequest.url.includes('/register') ||
      originalRequest.url.includes('/auth/login');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;

      try {
        const refreshToken = authStorage.getRefreshToken();

        if (!refreshToken) {
          authStorage.clearSession();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Try to refresh token
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;

        authStorage.setSession({ access });

        // Update authorization header
        originalRequest.headers.Authorization = `Bearer ${access}`;

        // Retry original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        authStorage.clearSession();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
