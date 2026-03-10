import { apiClient } from './apiClient'

export const studentService = {
  // Get all students
  async getStudents(activeOnly = false) {
    try {
      const response = await apiClient.get(`/students?activeOnly=${activeOnly}`)
      // Handle backend response format - either direct array or wrapped in data object
      if (response.data.students) {
        return response.data // { totalStudents: number, students: array }
      } else if (Array.isArray(response.data)) {
        return { students: response.data, totalStudents: response.data.length }
      } else {
        return { students: [], totalStudents: 0 }
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      throw error
    }
  },

  // Create new student (registration)
  async createStudent(studentData) {
    try {
      const response = await apiClient.post('/students', studentData)
      // Handle backend response - extract student data from response
      return response.data.data || response.data
    } catch (error) {
      console.error('Error creating student:', error)
      throw error
    }
  },

  // Get student by ID
  async getStudentById(id) {
    try {
      const response = await apiClient.get(`/students/${id}`)
      return response.data.data || response.data
    } catch (error) {
      console.error('Error fetching student:', error)
      throw error
    }
  },

  // Update student
  async updateStudent(id, studentData) {
    try {
      const response = await apiClient.put(`/students/${id}`, studentData)
      // Handle backend response - extract student data from response
      return response.data.data || response.data
    } catch (error) {
      console.error('Error updating student:', error)
      throw error
    }
  },

  // Delete student (soft delete)
  async deleteStudent(id, permanent = false) {
    try {
      const response = await apiClient.delete(`/students/${id}?permanent=${permanent}`)
      return response.data
    } catch (error) {
      console.error('Error deleting student:', error)
      throw error
    }
  },

  // Search students
  async searchStudents(query) {
    try {
      const response = await apiClient.get(`/students/search?q=${encodeURIComponent(query)}`)
      return response.data
    } catch (error) {
      console.error('Error searching students:', error)
      throw error
    }
  },

  // Advanced search with filters
  async searchWithFilters(filters) {
    try {
      const params = new URLSearchParams()
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key])
        }
      })
      
      const response = await apiClient.get(`/students/search?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error searching students with filters:', error)
      throw error
    }
  },

  // Get student results
  async getStudentResults(id) {
    try {
      const response = await apiClient.get(`/students/${id}/results`)
      return response.data
    } catch (error) {
      console.error('Error fetching student results:', error)
      throw error
    }
  },

  // Get student attendance
  async getStudentAttendance(id) {
    try {
      const response = await apiClient.get(`/students/${id}/attendance`)
      return response.data
    } catch (error) {
      console.error('Error fetching student attendance:', error)
      throw error
    }
  },

  // Get student enrollment details
  async getStudentEnrollment(id) {
    try {
      const response = await apiClient.get(`/students/${id}/enrollment`)
      return response.data
    } catch (error) {
      console.error('Error fetching student enrollment:', error)
      throw error
    }
  },

  // Bulk operations
  async bulkImportStudents(studentsData) {
    try {
      const response = await apiClient.post('/students/bulk-import', studentsData)
      return response.data
    } catch (error) {
      console.error('Error bulk importing students:', error)
      throw error
    }
  },

  async bulkUpdateStudents(updates) {
    try {
      const response = await apiClient.put('/students/bulk-update', updates)
      return response.data
    } catch (error) {
      console.error('Error bulk updating students:', error)
      throw error
    }
  },

  // Upload profile picture
  async uploadProfilePicture(id, file) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await apiClient.post(`/students/${id}/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      throw error
    }
  },

  // Upload birth certificate
  async uploadBirthCertificate(id, file) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await apiClient.post(`/students/${id}/birth-certificate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error uploading birth certificate:', error)
      throw error
    }
  },

  // Generate student ID (fallback auto-generation)
  async generateStudentId(className) {
    try {
      // Since the backend auto-generates student IDs, we don't need this endpoint
      // This is a fallback for the frontend form
      const year = new Date().getFullYear()
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      
      let classCode = 'STU'
      if (className) {
        if (className.toLowerCase().includes('primary')) {
          classCode = 'P'
          const classNum = className.replace(/[^0-9]/g, '')
          if (classNum) classCode += classNum
        } else if (className.toLowerCase().includes('senior')) {
          classCode = 'S'  
          const classNum = className.replace(/[^0-9]/g, '')
          if (classNum) classCode += classNum
        }
      }
      
      return { studentId: `${classCode}${year}${randomNum}` }
    } catch (error) {
      console.error('Error generating student ID:', error)
      throw error
    }
  },

  // Get student statistics
  async getStudentStatistics() {
    try {
      const response = await apiClient.get('/students/statistics')
      return response.data
    } catch (error) {
      console.error('Error fetching student statistics:', error)
      throw error
    }
  }
}