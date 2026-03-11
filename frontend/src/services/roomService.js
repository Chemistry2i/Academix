import apiClient from './apiClient'

const BASE_URL = '/rooms'

export const roomService = {
  // Get all rooms
  getAllRooms: async (options = {}) => {
    try {
      const params = new URLSearchParams()
      if (options.availableOnly) params.append('availableOnly', 'true')
      if (options.roomType) params.append('roomType', options.roomType)
      if (options.building) params.append('building', options.building)
      
      const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL
      const response = await apiClient.get(url)
      return response.data
    } catch (error) {
      console.error('Error fetching rooms:', error)
      throw error?.response?.data || error
    }
  },

  // Get available rooms only
  getAvailableRooms: async () => {
    try {
      const response = await apiClient.get(`${BASE_URL}?availableOnly=true`)
      return response.data
    } catch (error) {
      console.error('Error fetching available rooms:', error)
      throw error?.response?.data || error
    }
  },

  // Get rooms by type
  getRoomsByType: async (roomType) => {
    try {
      const response = await apiClient.get(`${BASE_URL}?roomType=${roomType}&availableOnly=true`)
      return response.data
    } catch (error) {
      console.error('Error fetching rooms by type:', error)
      throw error?.response?.data || error
    }
  },

  // Get rooms by building
  getRoomsByBuilding: async (building) => {
    try {
      const response = await apiClient.get(`${BASE_URL}?building=${building}&availableOnly=true`)
      return response.data
    } catch (error) {
      console.error('Error fetching rooms by building:', error)
      throw error?.response?.data || error
    }
  },

  // Get room by ID
  getRoomById: async (id) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching room by ID:', error)
      throw error?.response?.data || error
    }
  },

  // Get room by number
  getRoomByNumber: async (roomNumber) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/number/${roomNumber}`)
      return response.data
    } catch (error) {
      console.error('Error fetching room by number:', error)
      throw error?.response?.data || error
    }
  },

  // Get all buildings
  getBuildings: async () => {
    try {
      const response = await apiClient.get(`${BASE_URL}/buildings`)
      return response.data
    } catch (error) {
      console.error('Error fetching buildings:', error)
      throw error?.response?.data || error
    }
  },

  // Get all room types
  getRoomTypes: async () => {
    try {
      const response = await apiClient.get(`${BASE_URL}/types`)
      return response.data
    } catch (error) {
      console.error('Error fetching room types:', error)
      throw error?.response?.data || error
    }
  },

  // Create room
  createRoom: async (roomData) => {
    try {
      const response = await apiClient.post(BASE_URL, roomData)
      return response.data
    } catch (error) {
      console.error('Error creating room:', error)
      throw error?.response?.data || error
    }
  },

  // Update room
  updateRoom: async (id, roomData) => {
    try {
      const response = await apiClient.put(`${BASE_URL}/${id}`, roomData)
      return response.data
    } catch (error) {
      console.error('Error updating room:', error)
      throw error?.response?.data || error
    }
  },

  // Delete room
  deleteRoom: async (id) => {
    try {
      const response = await apiClient.delete(`${BASE_URL}/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting room:', error)
      throw error?.response?.data || error
    }
  }
}