import apiClient from './apiClient'
import { classService } from './classService'

const BASE_URL = '/attendance'

let classCache = null

const normalizeArray = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key]
  }

  const firstArray = Object.values(payload).find((value) => Array.isArray(value))
  return firstArray || []
}

const resolveClassName = async (classRef) => {
  if (!classRef) return ''
  if (typeof classRef === 'string' && classRef.trim()) return classRef.trim()
  if (typeof classRef === 'object') {
    return classRef.name || classRef.className || classRef.currentClass || ''
  }

  if (!classCache) {
    classCache = classService.getClasses().catch(() => [])
  }

  const classes = normalizeArray(await classCache, ['classes', 'data'])
  const matchedClass = classes.find((item) => String(item.id) === String(classRef))
  return matchedClass?.name || matchedClass?.className || String(classRef)
}

const normalizeStats = (payload = {}) => ({
  ...payload,
  presentCount: payload.presentCount ?? payload.present ?? payload.todayPresent ?? 0,
  absentCount: payload.absentCount ?? payload.absent ?? payload.todayAbsent ?? 0,
  lateCount: payload.lateCount ?? payload.late ?? payload.todayLate ?? 0,
  excusedCount: payload.excusedCount ?? payload.excused ?? 0,
  attendanceRate: payload.attendanceRate ?? payload.attendancePercentage ?? payload.todayAttendanceRate ?? 0,
  totalStudents: payload.totalStudents ?? payload.total ?? payload.todayTotal ?? 0,
  dailyAttendance: payload.dailyAttendance || payload.classSummary || []
})

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
  getAttendanceByDate: async (date, classRef = null) => {
    try {
      const className = await resolveClassName(classRef)

      if (className) {
        const response = await apiClient.get(`${BASE_URL}/class/${encodeURIComponent(className)}/date/${date}`)
        return response.data
      }

      const response = await apiClient.get(`${BASE_URL}/summary`, { params: { date } })
      return response.data
    } catch (error) {
      console.error('Error fetching attendance by date:', error)
      throw error?.response?.data || error
    }
  },

  // Get attendance for a student
  getStudentAttendance: async (studentId, startDate = null, endDate = null) => {
    try {
      if (startDate && endDate) {
        const response = await apiClient.get(`${BASE_URL}/student/${studentId}/range`, {
          params: { startDate, endDate }
        })
        return response.data
      }

      const response = await apiClient.get(`${BASE_URL}/student/${studentId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching student attendance:', error)
      throw error?.response?.data || error
    }
  },

  // Get attendance for a class
  getClassAttendance: async (classRef, startDate = null, endDate = null) => {
    try {
      const className = await resolveClassName(classRef)

      if (startDate && endDate) {
        const response = await apiClient.get(`${BASE_URL}/class/${encodeURIComponent(className)}/range`, {
          params: { startDate, endDate }
        })
        return response.data
      }

      const response = await apiClient.get(`${BASE_URL}/class/${encodeURIComponent(className)}`)
      return response.data
    } catch (error) {
      console.error('Error fetching class attendance:', error)
      throw error?.response?.data || error
    }
  },

  // Get attendance statistics
  getAttendanceStatistics: async (startDate = null, endDate = null, classNames = null) => {
    try {
      if (Array.isArray(classNames) && classNames.length === 1) {
        const className = await resolveClassName(classNames[0])
        const date = endDate || startDate || new Date().toISOString().split('T')[0]
        const response = await apiClient.get(`${BASE_URL}/class/${encodeURIComponent(className)}/stats`, {
          params: { date }
        })
        return normalizeStats(response.data)
      }

      const response = await apiClient.get(`${BASE_URL}/statistics`)
      return normalizeStats(response.data)
    } catch (error) {
      console.error('Error fetching attendance statistics:', error)
      throw error?.response?.data || error
    }
  },

  // Get daily attendance report
  getDailyReport: async (date, classNames = null) => {
    try {
      if (Array.isArray(classNames) && classNames.length === 1) {
        return await attendanceService.getAttendanceByDate(date, classNames[0])
      }

      const response = await apiClient.get(`${BASE_URL}/summary`, { params: { date } })
      return response.data
    } catch (error) {
      console.error('Error fetching daily attendance report:', error)
      throw error?.response?.data || error
    }
  },

  // Get weekly attendance report
  getWeeklyReport: async (startDate, endDate, classNames = null) => {
    try {
      if (Array.isArray(classNames) && classNames.length === 1) {
        return await attendanceService.getClassAttendance(classNames[0], startDate, endDate)
      }

      const response = await apiClient.get(`${BASE_URL}/statistics`)
      return normalizeStats(response.data)
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
      const response = await apiClient.get(`${BASE_URL}/class/${encodeURIComponent(className)}/today`, {
        params: date ? { date } : undefined
      })
      return response.data
    } catch (error) {
      console.error('Error fetching students for attendance:', error)
      throw error?.response?.data || error
    }
  }
}

export default attendanceService