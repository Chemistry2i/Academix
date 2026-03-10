import { apiClient } from './apiClient'

export const classService = {
  // Get all classes
  async getClasses() {
    try {
      const response = await apiClient.get('/classes')
      console.log('Classes API response:', response)
      console.log('Classes data:', response.data)
      console.log('Response data type:', typeof response.data)
      console.log('Response data is array:', Array.isArray(response.data))
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object, try to find an array property
        const possibleArrays = Object.values(response.data).filter(Array.isArray)
        if (possibleArrays.length > 0) {
          console.log('Found array in response object:', possibleArrays[0])
          return possibleArrays[0]
        }
      }
      
      console.warn('API response is not an array, returning empty array')
      return []
    } catch (error) {
      console.error('Error fetching classes:', error)
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
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
      console.log('Creating class with data:', classData)
      
      // Check if teacher assignment data is properly formatted
      if (classData.classTeacher) {
        console.log('Teacher assignment data:', classData.classTeacher)
      }
      
      const response = await apiClient.post('/classes', classData)
      console.log('Create class response:', response)
      console.log('Created class data:', response.data)
      
      // Validate response structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format from server')
      }
      
      return response.data
    } catch (error) {
      console.error('Error creating class:', error)
      console.error('Create class error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      
      // Provide specific error messages for common issues
      if (error.response?.status === 400 && error.response?.data?.error?.includes('Teacher not found')) {
        throw new Error('Selected teacher not found. Please refresh and try again.')
      }
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
        throw new Error('A class with this name already exists for this academic year.')
      }
      
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