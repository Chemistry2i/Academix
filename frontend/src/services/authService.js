import { apiClient } from './apiClient'
import { tokenService } from './tokenService'

class AuthService {
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      return {
        success: true,
        data: {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn,
          user: response.data.user
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      }
    }
  }

  async logout() {
    try {
      await apiClient.post('/auth/logout')
      return { success: true }
    } catch (error) {
      // Even if logout fails on server, we should clear local storage
      return { success: false }
    }
  }

  async refreshToken(refreshToken) {
    try {
      const response = await apiClient.post('/auth/refresh-token', {
        refreshToken
      })
      return {
        success: true,
        data: {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Token refresh failed'
      }
    }
  }

  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get user info'
      }
    }
  }

  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email })
      return {
        success: true,
        message: response.data.message
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset request failed'
      }
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        newPassword
      })
      return {
        success: true,
        message: response.data.message
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset failed'
      }
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.put('/auth/change-password', {
        currentPassword,
        newPassword
      })
      return {
        success: true,
        message: response.data.message
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password change failed'
      }
    }
  }

  async verifyEmail(token) {
    try {
      const response = await apiClient.post('/auth/verify-email', { token })
      return {
        success: true,
        message: response.data.message
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Email verification failed'
      }
    }
  }

  async resendVerificationEmail(email) {
    try {
      const response = await apiClient.post('/auth/resend-verification', { email })
      return {
        success: true,
        message: response.data.message
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend verification email'
      }
    }
  }
}

export const authService = new AuthService()