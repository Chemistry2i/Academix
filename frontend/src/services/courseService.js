import { apiClient } from './apiClient'

export const courseService = {
  // Get all courses
  async getCourses() {
    try {
      const response = await apiClient.get('/courses')
      return response.data || []
    } catch (error) {
      console.error('Error fetching courses:', error)
      throw error
    }
  },

  // Get course by ID
  async getCourseById(id) {
    try {
      const response = await apiClient.get(`/courses/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching course:', error)
      throw error
    }
  },

  // Get course by code
  async getCourseByCode(code) {
    try {
      const response = await apiClient.get(`/courses/code/${code}`)
      return response.data
    } catch (error) {
      console.error('Error fetching course by code:', error)
      throw error
    }
  },

  // Search courses
  async searchCourses(searchTerm) {
    try {
      const response = await apiClient.get(`/courses/search?q=${encodeURIComponent(searchTerm)}`)
      return response.data
    } catch (error) {
      console.error('Error searching courses:', error)
      throw error
    }
  },

  // Create new course
  async createCourse(courseData) {
    try {
      const response = await apiClient.post('/courses', courseData)
      return response.data
    } catch (error) {
      console.error('Error creating course:', error)
      throw error
    }
  },

  // Update course
  async updateCourse(id, courseData) {
    try {
      const response = await apiClient.put(`/courses/${id}`, courseData)
      return response.data
    } catch (error) {
      console.error('Error updating course:', error)
      throw error
    }
  },

  // Delete course
  async deleteCourse(id) {
    try {
      const response = await apiClient.delete(`/courses/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting course:', error)
      throw error
    }
  },

  // Get available (active) courses
  async getAvailableCourses() {
    try {
      const response = await apiClient.get('/courses/available')
      return response.data
    } catch (error) {
      console.error('Error fetching available courses:', error)
      throw error
    }
  },

  // Get courses by type
  async getCoursesByType(type) {
    try {
      const response = await apiClient.get(`/courses/type/${type}`)
      return response.data
    } catch (error) {
      console.error('Error fetching courses by type:', error)
      throw error
    }
  },

  // Get science courses
  async getScienceCourses() {
    try {
      const response = await apiClient.get('/courses/science')
      return response.data
    } catch (error) {
      console.error('Error fetching science courses:', error)
      throw error
    }
  },

  // Get arts courses
  async getArtsCourses() {
    try {
      const response = await apiClient.get('/courses/arts')
      return response.data
    } catch (error) {
      console.error('Error fetching arts courses:', error)
      throw error
    }
  },

  // Get course statistics
  async getCourseStatistics() {
    try {
      const response = await apiClient.get('/courses/statistics')
      return response.data
    } catch (error) {
      console.error('Error fetching course statistics:', error)
      // Fallback to calculating from all courses
      const courses = await this.getCourses()
      return {
        total: courses.length,
        active: courses.filter(c => c.isActive !== false).length,
        sciences: courses.filter(c => c.type === 'SCIENCES').length,
        arts: courses.filter(c => c.type === 'ARTS').length,
        technical: courses.filter(c => c.type === 'TECHNICAL').length,
        mixed: courses.filter(c => c.type === 'MIXED').length,
        aLevel: courses.filter(c => c.level === 'A_LEVEL').length,
        oLevel: courses.filter(c => c.level === 'O_LEVEL').length,
        totalEnrollment: courses.reduce((sum, course) => sum + (course.currentEnrollment || 0), 0),
        totalCapacity: courses.reduce((sum, course) => sum + (course.maxStudents || 0), 0)
      }
    }
  }
}