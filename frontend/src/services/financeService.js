import { apiClient } from './apiClient'

class FinanceService {
  async getStats() {
    try {
      const response = await apiClient.get('/finance/stats')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch finance stats'
      }
    }
  }

  async getRevenueBreakdown() {
    try {
      const response = await apiClient.get('/finance/revenue')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch revenue breakdown'
      }
    }
  }

  async getExpenseBreakdown() {
    try {
      const response = await apiClient.get('/finance/expenses')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch expense breakdown'
      }
    }
  }

  async getPaymentHistory(filters = {}) {
    try {
      const response = await apiClient.get('/finance/payments', { params: filters })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch payment history'
      }
    }
  }

  async getFeeStructure() {
    try {
      const response = await apiClient.get('/finance/fee-structure')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch fee structure'
      }
    }
  }

  async getOutstandingFees(filters = {}) {
    try {
      const response = await apiClient.get('/finance/outstanding-fees', { params: filters })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch outstanding fees'
      }
    }
  }
}

export const financeService = new FinanceService()