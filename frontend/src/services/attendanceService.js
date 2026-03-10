import apiClient from './apiClient'

const BASE_URL = '/attendance'

export const attendanceService = {
  // Mark single attendance
  markAttendance: async (attendanceData) => {
    try {
      const response = await apiClient.post(`${BASE_URL}/mark`, attendanceData)
      return response.data
    } catch (error) {
      console.error('Error marking attendance:', error)
      throw error?.response?.data || error
    }
  },

  // Mark bulk attendance
  markBulkAttendance: async (attendanceList) => {
    try {
      const response = await apiClient.post(`${BASE_URL}/bulk`, attendanceList)
      return response.data
    } catch (error) {
      console.error('Error marking bulk attendance:', error)
      throw error?.response?.data || error
    }
  },

  // Get attendance for a specific date
  getAttendanceByDate: async (date, classId = null) => {
    try {
      const params = { date }
      if (classId) params.classId = classId
      const response = await apiClient.get(`${BASE_URL}/date`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching attendance by date:', error)
      throw error?.response?.data || error
    }
  },

  // Get attendance for a student
  getStudentAttendance: async (studentId, startDate = null, endDate = null) => {
    try {
      const params = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      const response = await apiClient.get(`${BASE_URL}/student/${studentId}`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching student attendance:', error)
      throw error?.response?.data || error
    }
  },

  // Get attendance for a class
  getClassAttendance: async (className, startDate = null, endDate = null) => {
    try {
      const params = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      const response = await apiClient.get(`${BASE_URL}/class/${className}`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching class attendance:', error)
      throw error?.response?.data || error
    }
  },

  // Get attendance statistics
  getAttendanceStatistics: async (startDate = null, endDate = null, classNames = null) => {
    try {
      const params = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      if (classNames) params.classNames = classNames.join(',')
      const response = await apiClient.get(`${BASE_URL}/statistics`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching attendance statistics:', error)
      throw error?.response?.data || error
    }
  },

  // Get daily attendance report
  getDailyReport: async (date, classNames = null) => {
    try {
      const params = { date }
      if (classNames) params.classNames = classNames.join(',')
      const response = await apiClient.get(`${BASE_URL}/reports/daily`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching daily attendance report:', error)
      throw error?.response?.data || error
    }
  },

  // Get weekly attendance report
  getWeeklyReport: async (startDate, endDate, classNames = null) => {
    try {
      const params = { startDate, endDate }
      if (classNames) params.classNames = classNames.join(',')
      const response = await apiClient.get(`${BASE_URL}/reports/weekly`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching weekly attendance report:', error)
      throw error?.response?.data || error
    }
  },

  // Update attendance
  updateAttendance: async (attendanceId, attendanceData) => {
    try {
      const response = await apiClient.put(`${BASE_URL}/${attendanceId}`, attendanceData)
      return response.data
    } catch (error) {
      console.error('Error updating attendance:', error)
      throw error?.response?.data || error
    }
  },

  // Delete attendance
  deleteAttendance: async (attendanceId) => {
    try {
      const response = await apiClient.delete(`${BASE_URL}/${attendanceId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting attendance:', error)
      throw error?.response?.data || error
    }
  },

  // Get students for attendance marking
  getStudentsForAttendance: async (className, date = null) => {
    try {
      const params = {}
      if (date) params.date = date
      const response = await apiClient.get(`${BASE_URL}/students/${className}`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching students for attendance:', error)
      throw error?.response?.data || error
    }
  }
}

export default attendanceService