import apiClient from './apiClient'

const BASE_URL = '/timetable'

export const timetableService = {
  // Create timetable entry
  createTimetableEntry: async (timetableData) => {
    try {
      const response = await apiClient.post(BASE_URL, timetableData)
      return response.data
    } catch (error) {
      console.error('Error creating timetable entry:', error)
      throw error?.response?.data || error
    }
  },

  // Create bulk timetable entries
  createBulkTimetableEntries: async (entries) => {
    try {
      const response = await apiClient.post(`${BASE_URL}/bulk`, entries)
      return response.data
    } catch (error) {
      console.error('Error creating bulk timetable entries:', error)
      throw error?.response?.data || error
    }
  },

  // Get all timetables
  getAllTimetables: async () => {
    try {
      const response = await apiClient.get(BASE_URL)
      return response.data
    } catch (error) {
      console.error('Error fetching all timetables:', error)
      throw error?.response?.data || error
    }
  },

  // Get timetable for a specific class
  getClassTimetable: async (className, term = null, academicYear = null) => {
    try {
      const params = {}
      if (term) params.term = term
      if (academicYear) params.academicYear = academicYear
      const response = await apiClient.get(`${BASE_URL}/class/${className}`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching class timetable:', error)
      throw error?.response?.data || error
    }
  },

  // Get timetable for a specific teacher
  getTeacherTimetable: async (teacherId, term = null, academicYear = null) => {
    try {
      const params = {}
      if (term) params.term = term
      if (academicYear) params.academicYear = academicYear
      const response = await apiClient.get(`${BASE_URL}/teacher/${teacherId}`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching teacher timetable:', error)
      throw error?.response?.data || error
    }
  },

  // Get timetable by day of week
  getTimetableByDay: async (dayOfWeek, className = null, academicYear = null, term = null) => {
    try {
      const params = { dayOfWeek }
      if (className) params.className = className
      if (academicYear) params.academicYear = academicYear
      if (term) params.term = term
      const response = await apiClient.get(`${BASE_URL}/day`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching timetable by day:', error)
      throw error?.response?.data || error
    }
  },

  // Get daily timetable
  getDailyTimetable: async (className = null, teacherId = null) => {
    try {
      const params = {}
      if (className) params.className = className
      if (teacherId) params.teacherId = teacherId
      const response = await apiClient.get(`${BASE_URL}/today`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching daily timetable:', error)
      throw error?.response?.data || error
    }
  },

  // Update timetable entry
  updateTimetableEntry: async (timetableId, timetableData) => {
    try {
      const response = await apiClient.put(`${BASE_URL}/${timetableId}`, timetableData)
      return response.data
    } catch (error) {
      console.error('Error updating timetable entry:', error)
      throw error?.response?.data || error
    }
  },

  // Delete timetable entry
  deleteTimetableEntry: async (timetableId) => {
    try {
      const response = await apiClient.delete(`${BASE_URL}/${timetableId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting timetable entry:', error)
      throw error?.response?.data || error
    }
  },

  // Get timetable conflicts
  checkTimetableConflicts: async (timetableData) => {
    try {
      const response = await apiClient.post(`${BASE_URL}/check-conflicts`, timetableData)
      return response.data
    } catch (error) {
      console.error('Error checking timetable conflicts:', error)
      throw error?.response?.data || error
    }
  },

  // Get timetable statistics
  getTimetableStatistics: async (academicYear = null, term = null) => {
    try {
      const params = {}
      if (academicYear) params.academicYear = academicYear
      if (term) params.term = term
      const response = await apiClient.get(`${BASE_URL}/statistics`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching timetable statistics:', error)
      throw error?.response?.data || error
    }
  },

  // Get available periods for a class
  getAvailablePeriods: async (className, dayOfWeek, academicYear = null, term = null) => {
    try {
      const params = { className, dayOfWeek }
      if (academicYear) params.academicYear = academicYear
      if (term) params.term = term
      const response = await apiClient.get(`${BASE_URL}/available-periods`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching available periods:', error)
      throw error?.response?.data || error
    }
  },

  // Copy timetable from previous term
  copyTimetable: async (fromTerm, fromYear, toTerm, toYear) => {
    try {
      const response = await apiClient.post(`${BASE_URL}/copy`, {
        fromTerm,
        fromYear,
        toTerm,
        toYear
      })
      return response.data
    } catch (error) {
      console.error('Error copying timetable:', error)
      throw error?.response?.data || error
    }
  }
}

export default timetableService