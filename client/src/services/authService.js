// Academix - Authentication Service
import { api } from './api';
import { AUTH_ENDPOINTS } from '../config/apiEndpoints';

export const authService = {
  /**
   * Universal login for all user types (students, staff, admin)
   * @param {Object} credentials - { email, password }
   * @returns {Promise} - { success, data: { user, token, dashboardUrl } }
   */
  login: async (credentials) => {
    try {
      // Use standard login endpoint (now supports all user types)
      const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
      
      // Add dashboard URL based on user role
      const userData = response.data;
      if (userData.user) {
        userData.dashboardUrl = authService.getDashboardUrl(userData.user.role);
      }
      
      return { success: true, data: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  },

  /**
   * Get dashboard URL based on user role/type
   * @param {string} userRole - User role (STUDENT, TEACHER, STAFF, ADMIN)
   * @returns {string} - Dashboard URL path
   */
  getDashboardUrl: (userRole) => {
    switch(userRole?.toUpperCase()) {
      case 'STUDENT':
        return '/student/dashboard';
      case 'TEACHER':
      case 'STAFF':
        return '/staff/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/dashboard';
    }
  },

  /**
   * Legacy login (general auth users only)
   * @param {Object} credentials - { email, password }
   * @returns {Promise} - { success, data: { user, token } }
   */
  legacyLogin: async (credentials) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  },

  /**
   * Register new user (Admin only)
   * @param {Object} userData - User registration data
   * @returns {Promise}
   */
  register: async (userData) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors,
      };
    }
  },

  /**
   * Logout user
   * @returns {Promise}
   */
  logout: async () => {
    try {
      await api.post(AUTH_ENDPOINTS.LOGOUT);
      return { success: true };
    } catch (error) {
      // Even if logout fails on server, we consider it successful on client
      return { success: true };
    }
  },

  /**
   * Get current authenticated user
   * @returns {Promise}
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get(AUTH_ENDPOINTS.ME);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get user',
      };
    }
  },

  /**
   * Refresh access token
   * @returns {Promise}
   */
  refreshToken: async () => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.REFRESH_TOKEN);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Token refresh failed',
      };
    }
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise}
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
      return { success: true, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset email',
      };
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise}
   */
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
        token,
        password: newPassword,
      });
      return { success: true, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password',
      };
    }
  },

  /**
   * Change password (authenticated)
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise}
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });
      return { success: true, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password',
      };
    }
  },

  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise}
   */
  verifyEmail: async (token) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.VERIFY_EMAIL, { token });
      return { success: true, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Email verification failed',
      };
    }
  },
};

export default authService;
