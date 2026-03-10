import apiClient from './apiClient'

const BASE_URL = '/subjects'

export const subjectService = {
  // Create a new subject
  createSubject: async (subjectData) => {
    try {
      const response = await apiClient.post(BASE_URL, subjectData)
      return response.data
    } catch (error) {
      console.error('Error creating subject:', error)
      throw error?.response?.data || error
    }
  },

  // Get all subjects
  getAllSubjects: async () => {
    try {
      const response = await apiClient.get(BASE_URL)
      return response.data
    } catch (error) {
      console.error('Error fetching all subjects:', error)
      throw error?.response?.data || error
    }
  },

  // Get subject by ID
  getSubjectById: async (subjectId) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/${subjectId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching subject by ID:', error)
      throw error?.response?.data || error
    }
  },

  // Get subjects by level
  getSubjectsByLevel: async (level) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/level/${level}`)
      return response.data
    } catch (error) {
      console.error('Error fetching subjects by level:', error)
      throw error?.response?.data || error
    }
  },

  // Get subjects by category
  getSubjectsByCategory: async (category) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/category/${category}`)
      return response.data
    } catch (error) {
      console.error('Error fetching subjects by category:', error)
      throw error?.response?.data || error
    }
  },

  // Get active subjects
  getActiveSubjects: async () => {
    try {
      const response = await apiClient.get(`${BASE_URL}/active`)
      return response.data
    } catch (error) {
      console.error('Error fetching active subjects:', error)
      throw error?.response?.data || error
    }
  },

  // Get compulsory subjects
  getCompulsorySubjects: async (level = null) => {
    try {
      const params = level ? { level } : {}
      const response = await apiClient.get(`${BASE_URL}/compulsory`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching compulsory subjects:', error)
      throw error?.response?.data || error
    }
  },

  // Get elective subjects
  getElectiveSubjects: async (level = null) => {
    try {
      const params = level ? { level } : {}
      const response = await apiClient.get(`${BASE_URL}/elective`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching elective subjects:', error)
      throw error?.response?.data || error
    }
  },

  // Get science subjects
  getScienceSubjects: async () => {
    try {
      const response = await apiClient.get(`${BASE_URL}/science`)
      return response.data
    } catch (error) {
      console.error('Error fetching science subjects:', error)
      throw error?.response?.data || error
    }
  },

  // Get arts subjects
  getArtsSubjects: async () => {
    try {
      const response = await apiClient.get(`${BASE_URL}/arts`)
      return response.data
    } catch (error) {
      console.error('Error fetching arts subjects:', error)
      throw error?.response?.data || error
    }
  },

  // Update subject
  updateSubject: async (subjectId, subjectData) => {
    try {
      const response = await apiClient.put(`${BASE_URL}/${subjectId}`, subjectData)
      return response.data
    } catch (error) {
      console.error('Error updating subject:', error)
      throw error?.response?.data || error
    }
  },

  // Delete subject
  deleteSubject: async (subjectId) => {
    try {
      const response = await apiClient.delete(`${BASE_URL}/${subjectId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting subject:', error)
      throw error?.response?.data || error
    }
  },

  // Search subjects
  searchSubjects: async (query) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/search`, { params: { q: query } })
      return response.data
    } catch (error) {
      console.error('Error searching subjects:', error)
      throw error?.response?.data || error
    }
  },

  // Get subject statistics
  getSubjectStatistics: async () => {
    try {
      const response = await apiClient.get(`${BASE_URL}/statistics`)
      return response.data
    } catch (error) {
      console.error('Error fetching subject statistics:', error)
      throw error?.response?.data || error
    }
  },

  // Get subject combinations
  getSubjectCombinations: async (level = null) => {
    try {
      const params = level ? { level } : {}
      const response = await apiClient.get(`${BASE_URL}/combinations`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching subject combinations:', error)
      throw error?.response?.data || error
    }
  },

  // Validate subject combination
  validateSubjectCombination: async (subjects, level) => {
    try {
      const response = await apiClient.post(`${BASE_URL}/validate-combination`, {
        subjects,
        level
      })
      return response.data
    } catch (error) {
      console.error('Error validating subject combination:', error)
      throw error?.response?.data || error
    }
  },

  // Add prerequisite
  addPrerequisite: async (subjectId, prerequisiteId) => {
    try {
      const response = await apiClient.post(`${BASE_URL}/${subjectId}/prerequisites`, {
        prerequisiteId
      })
      return response.data
    } catch (error) {
      console.error('Error adding prerequisite:', error)
      throw error?.response?.data || error
    }
  },

  // Remove prerequisite
  removePrerequisite: async (subjectId, prerequisiteId) => {
    try {
      const response = await apiClient.delete(`${BASE_URL}/${subjectId}/prerequisites/${prerequisiteId}`)
      return response.data
    } catch (error) {
      console.error('Error removing prerequisite:', error)
      throw error?.response?.data || error
    }
  },

  // Get subject prerequisites
  getSubjectPrerequisites: async (subjectId) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/${subjectId}/prerequisites`)
      return response.data
    } catch (error) {
      console.error('Error fetching subject prerequisites:', error)
      throw error?.response?.data || error
    }
  },

  // Check if subjects can be combined
  canCombineSubjects: async (subjectIds, level) => {
    try {
      const response = await apiClient.post(`${BASE_URL}/can-combine`, {
        subjectIds,
        level
      })
      return response.data
    } catch (error) {
      console.error('Error checking if subjects can be combined:', error)
      throw error?.response?.data || error
    }
  }
}

export default subjectService