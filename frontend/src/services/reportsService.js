import { apiClient } from './apiClient'

class ReportsService {
  async getStats() {
    try {
      const response = await apiClient.get('/reports/stats')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch reports stats'
      }
    }
  }

  async getAvailableReports() {
    try {
      const response = await apiClient.get('/reports/available')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch available reports'
      }
    }
  }

  async generateReport(reportType, filters = {}) {
    try {
      const response = await apiClient.post('/reports/generate', {
        reportType,
        filters
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate report'
      }
    }
  }

  async downloadReport(reportId) {
    try {
      const response = await apiClient.get(`/reports/download/${reportId}`, {
        responseType: 'blob'
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to download report'
      }
    }
  }

  async getReportHistory(filters = {}) {
    try {
      const response = await apiClient.get('/reports/history', { params: filters })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch report history'
      }
    }
  }
}

export const reportsService = new ReportsService()