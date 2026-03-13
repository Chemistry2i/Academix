import { apiClient } from './apiClient'

export const teacherService = {
  // Get all teachers
  async getTeachers(activeOnly = false) {
    try {
      const response = await apiClient.get(`/teachers?activeOnly=${activeOnly}`)
      // Handle backend response format - either direct array or wrapped in data object
      if (response.data.teachers) {
        return response.data // { totalTeachers: number, teachers: array }
      } else if (Array.isArray(response.data)) {
        return { teachers: response.data, totalTeachers: response.data.length }
      } else {
        return { teachers: [], totalTeachers: 0 }
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
      throw error
    }
  },

  // Get teacher by ID
  async getTeacherById(id) {
    try {
      const response = await apiClient.get(`/teachers/${id}`)
      return response.data.data || response.data
    } catch (error) {
      console.error('Error fetching teacher:', error)
      throw error
    }
  },

  // Create new teacher
  async createTeacher(teacherData) {
    try {
      const response = await apiClient.post('/teachers', teacherData)
      return response.data.data || response.data
    } catch (error) {
      console.error('Error creating teacher:', error)
      throw error
    }
  },

  // Update teacher
  async updateTeacher(id, teacherData) {
    try {
      const response = await apiClient.put(`/teachers/${id}`, teacherData)
      return response.data.data || response.data
    } catch (error) {
      console.error('Error updating teacher:', error)
      throw error
    }
  },

  // Delete teacher
  async deleteTeacher(id) {
    try {
      const response = await apiClient.delete(`/teachers/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting teacher:', error)
      throw error
    }
  },

  // Get available teachers (for class assignment)
  async getAvailableTeachers() {
    try {
      const response = await apiClient.get('/teachers?available=true')
      return response.data
    } catch (error) {
      console.error('Error fetching available teachers:', error)
      throw error
    }
  },

  // Assign teacher to class
  async assignToClass(teacherId, classId) {
    try {
      const response = await apiClient.post(`/teachers/${teacherId}/assign-class/${classId}`)
      return response.data
    } catch (error) {
      console.error('Error assigning teacher to class:', error)
      throw error
    }
  },

  // Remove teacher from class
  async removeFromClass(teacherId, classId) {
    try {
      const response = await apiClient.delete(`/teachers/${teacherId}/remove-class/${classId}`)
      return response.data
    } catch (error) {
      console.error('Error removing teacher from class:', error)
      throw error
    }
  },

  // Get teacher's classes
  async getTeacherClasses(teacherId) {
    try {
      const response = await apiClient.get(`/teachers/${teacherId}/classes`)
      return response.data
    } catch (error) {
      console.error('Error fetching teacher classes:', error)
      throw error
    }
  },

  // Get teacher statistics
  async getTeacherStatistics() {
    try {
      const response = await apiClient.get('/teachers/statistics')
      return response.data
    } catch (error) {
      console.error('Error fetching teacher statistics:', error)
      throw error
    }
  },

  // Search teachers
  async searchTeachers(query) {
    try {
      const response = await apiClient.get(`/teachers/search?q=${encodeURIComponent(query)}`)
      return response.data
    } catch (error) {
      console.error('Error searching teachers:', error)
      throw error
    }
  }
}