import { apiClient } from './apiClient'

export const classService = {
  // Get all classes
  async getClasses() {
    try {
      const response = await apiClient.get('/classes')
      return response.data
    } catch (error) {
      console.error('Error fetching classes:', error)
      throw error
    }
  },

  // Get class by ID
  async getClassById(id) {
    try {
      const response = await apiClient.get(`/classes/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching class:', error)
      throw error
    }
  },

  // Get classes by academic year
  async getClassesByYear(academicYear) {
    try {
      const response = await apiClient.get(`/classes/year/${academicYear}`)
      return response.data
    } catch (error) {
      console.error('Error fetching classes by year:', error)
      throw error
    }
  },

  // Get O-Level classes
  async getOLevelClasses(academicYear) {
    try {
      const response = await apiClient.get(`/classes/o-level?academicYear=${academicYear}`)
      return response.data
    } catch (error) {
      console.error('Error fetching O-Level classes:', error)
      throw error
    }
  },

  // Get A-Level classes
  async getALevelClasses(academicYear) {
    try {
      const response = await apiClient.get(`/classes/a-level?academicYear=${academicYear}`)
      return response.data
    } catch (error) {
      console.error('Error fetching A-Level classes:', error)
      throw error
    }
  },

  // Create new class
  async createClass(classData) {
    try {
      const response = await apiClient.post('/classes', classData)
      return response.data
    } catch (error) {
      console.error('Error creating class:', error)
      throw error
    }
  },

  // Update class
  async updateClass(id, classData) {
    try {
      const response = await apiClient.put(`/classes/${id}`, classData)
      return response.data
    } catch (error) {
      console.error('Error updating class:', error)
      throw error
    }
  },

  // Delete class
  async deleteClass(id) {
    try {
      const response = await apiClient.delete(`/classes/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting class:', error)
      throw error
    }
  },

  // Assign class teacher
  async assignClassTeacher(classId, teacherId) {
    try {
      const response = await apiClient.post(`/classes/${classId}/teacher/${teacherId}`)
      return response.data
    } catch (error) {
      console.error('Error assigning class teacher:', error)
      throw error
    }
  },

  // Assign course to class (A-Level)
  async assignCourse(classId, courseId) {
    try {
      const response = await apiClient.post(`/classes/${classId}/course/${courseId}`)
      return response.data
    } catch (error) {
      console.error('Error assigning course to class:', error)
      throw error
    }
  },

  // Search classes
  async searchClasses(searchTerm) {
    try {
      const response = await apiClient.get(`/classes/search?q=${encodeURIComponent(searchTerm)}`)
      return response.data
    } catch (error) {
      console.error('Error searching classes:', error)
      throw error
    }
  },

  // Get enrollment summary
  async getEnrollmentSummary(academicYear) {
    try {
      const response = await apiClient.get(`/classes/enrollment-summary?academicYear=${academicYear}`)
      return response.data
    } catch (error) {
      console.error('Error fetching enrollment summary:', error)
      throw error
    }
  },

  // Initialize default classes
  async initializeDefaultClasses(academicYear) {
    try {
      const response = await apiClient.post(`/classes/initialize?academicYear=${academicYear}`)
      return response.data
    } catch (error) {
      console.error('Error initializing default classes:', error)
      throw error
    }
  }
}