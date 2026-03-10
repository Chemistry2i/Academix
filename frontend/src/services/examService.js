import apiClient from './apiClient'

const BASE_URL = '/exams'

export const examService = {
  // Create a new exam
  createExam: async (examData) => {
    try {
      const response = await apiClient.post(BASE_URL, examData)
      return response.data
    } catch (error) {
      console.error('Error creating exam:', error)
      throw error?.response?.data || error
    }
  },

  // Get all exams
  getAllExams: async () => {
    try {
      const response = await apiClient.get(BASE_URL)
      return response.data
    } catch (error) {
      console.error('Error fetching all exams:', error)
      throw error?.response?.data || error
    }
  },

  // Get exam by ID
  getExamById: async (examId) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/${examId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching exam by ID:', error)
      throw error?.response?.data || error
    }
  },

  // Get exams by academic year and term
  getExamsByYearAndTerm: async (academicYear, term) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/year/${academicYear}/term/${term}`)
      return response.data
    } catch (error) {
      console.error('Error fetching exams by year and term:', error)
      throw error?.response?.data || error
    }
  },

  // Get exams by type
  getExamsByType: async (examType) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/type/${examType}`)
      return response.data
    } catch (error) {
      console.error('Error fetching exams by type:', error)
      throw error?.response?.data || error
    }
  },

  // Get exams by level
  getExamsByLevel: async (examLevel) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/level/${examLevel}`)
      return response.data
    } catch (error) {
      console.error('Error fetching exams by level:', error)
      throw error?.response?.data || error
    }
  },

  // Get current active exams
  getCurrentExams: async () => {
    try {
      const response = await apiClient.get(`${BASE_URL}/current`)
      return response.data
    } catch (error) {
      console.error('Error fetching current exams:', error)
      throw error?.response?.data || error
    }
  },

  // Get upcoming exams
  getUpcomingExams: async () => {
    try {
      const response = await apiClient.get(`${BASE_URL}/upcoming`)
      return response.data
    } catch (error) {
      console.error('Error fetching upcoming exams:', error)
      throw error?.response?.data || error
    }
  },

  // Update exam
  updateExam: async (examId, examData) => {
    try {
      const response = await apiClient.put(`${BASE_URL}/${examId}`, examData)
      return response.data
    } catch (error) {
      console.error('Error updating exam:', error)
      throw error?.response?.data || error
    }
  },

  // Delete exam
  deleteExam: async (examId) => {
    try {
      const response = await apiClient.delete(`${BASE_URL}/${examId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting exam:', error)
      throw error?.response?.data || error
    }
  },

  // Update exam status
  updateExamStatus: async (examId, status) => {
    try {
      const response = await apiClient.patch(`${BASE_URL}/${examId}/status`, { status })
      return response.data
    } catch (error) {
      console.error('Error updating exam status:', error)
      throw error?.response?.data || error
    }
  },

  // Lock exam
  lockExam: async (examId) => {
    try {
      const response = await apiClient.patch(`${BASE_URL}/${examId}/lock`)
      return response.data
    } catch (error) {
      console.error('Error locking exam:', error)
      throw error?.response?.data || error
    }
  },

  // Unlock exam
  unlockExam: async (examId) => {
    try {
      const response = await apiClient.patch(`${BASE_URL}/${examId}/unlock`)
      return response.data
    } catch (error) {
      console.error('Error unlocking exam:', error)
      throw error?.response?.data || error
    }
  },

  // Publish exam results
  publishResults: async (examId) => {
    try {
      const response = await apiClient.patch(`${BASE_URL}/${examId}/publish`)
      return response.data
    } catch (error) {
      console.error('Error publishing exam results:', error)
      throw error?.response?.data || error
    }
  },

  // Unpublish exam results
  unpublishResults: async (examId) => {
    try {
      const response = await apiClient.patch(`${BASE_URL}/${examId}/unpublish`)
      return response.data
    } catch (error) {
      console.error('Error unpublishing exam results:', error)
      throw error?.response?.data || error
    }
  },

  // Get exam statistics
  getExamStatistics: async () => {
    try {
      const response = await apiClient.get(`${BASE_URL}/statistics`)
      return response.data
    } catch (error) {
      console.error('Error fetching exam statistics:', error)
      throw error?.response?.data || error
    }
  },

  // Get exam papers for an exam
  getExamPapers: async (examId) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/${examId}/papers`)
      return response.data
    } catch (error) {
      console.error('Error fetching exam papers:', error)
      throw error?.response?.data || error
    }
  },

  // Create exam paper
  createExamPaper: async (examId, paperData) => {
    try {
      const response = await apiClient.post(`${BASE_URL}/${examId}/papers`, paperData)
      return response.data
    } catch (error) {
      console.error('Error creating exam paper:', error)
      throw error?.response?.data || error
    }
  },

  // Update exam paper
  updateExamPaper: async (examId, paperId, paperData) => {
    try {
      const response = await apiClient.put(`${BASE_URL}/${examId}/papers/${paperId}`, paperData)
      return response.data
    } catch (error) {
      console.error('Error updating exam paper:', error)
      throw error?.response?.data || error
    }
  },

  // Delete exam paper
  deleteExamPaper: async (examId, paperId) => {
    try {
      const response = await apiClient.delete(`${BASE_URL}/${examId}/papers/${paperId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting exam paper:', error)
      throw error?.response?.data || error
    }
  }
}

export default examService