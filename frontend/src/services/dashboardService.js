import { apiClient } from './apiClient'

class DashboardService {
  async getStats() {
    try {
      const response = await apiClient.get('/dashboard/stats')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch dashboard stats'
      }
    }
  }

  async getStudentStats() {
    try {
      const response = await apiClient.get('/students/statistics')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch student stats'
      }
    }
  }

  async getTeacherStats() {
    try {
      const response = await apiClient.get('/teachers/statistics')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch teacher stats'
      }
    }
  }

  async getCourseStats() {
    try {
      const response = await apiClient.get('/courses/statistics')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch course stats'
      }
    }
  }

  async getRecentActivity() {
    try {
      const response = await apiClient.get('/dashboard/recent-activity')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch recent activity'
      }
    }
  }
}

export const dashboardService = new DashboardService()