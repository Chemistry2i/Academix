import { apiClient } from './apiClient'
import departmentService from './departmentService'

export const staffService = {
  // Get all staff members
  async getStaff(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.department) params.append('department', filters.department)
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)
      
      const response = await apiClient.get(`/staff?${params}`)
      // Handle backend response format - either direct array or wrapped in data object
      if (response.data.staff) {
        return response.data // { totalStaff: number, staff: array }
      } else if (Array.isArray(response.data)) {
        return { staff: response.data, totalStaff: response.data.length }
      } else {
        return { staff: [], totalStaff: 0 }
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
      throw error
    }
  },

  // Get staff by ID
  async getStaffById(id) {
    try {
      const response = await apiClient.get(`/staff/${id}`)
      return response.data.data || response.data
    } catch (error) {
      console.error('Error fetching staff member:', error)
      throw error
    }
  },

  // Search staff
  async searchStaff(searchTerm) {
    try {
      const response = await apiClient.get(`/staff/search?query=${encodeURIComponent(searchTerm)}`)
      return response.data
    } catch (error) {
      console.error('Error searching staff:', error)
      throw error
    }
  },

  // Create new staff member
  async createStaff(staffData) {
    try {
      const response = await apiClient.post('/staff', staffData)
      return response.data.data || response.data
    } catch (error) {
      console.error('Error creating staff member:', error)
      throw error
    }
  },

  // Update staff member
  async updateStaff(id, staffData) {
    try {
      const response = await apiClient.put(`/staff/${id}`, staffData)
      return response.data.data || response.data
    } catch (error) {
      console.error('Error updating staff member:', error)
      throw error
    }
  },

  // Delete staff member
  async deleteStaff(id) {
    try {
      const response = await apiClient.delete(`/staff/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting staff member:', error)
      throw error
    }
  },

  // Update staff status
  async updateStaffStatus(id, status) {
    try {
      const response = await apiClient.put(`/staff/${id}/status`, { status })
      return response.data.data || response.data
    } catch (error) {
      console.error('Error updating staff status:', error)
      throw error
    }
  },

  // Get departments
  async getDepartments() {
    try {
      return await departmentService.getDepartmentNames()
    } catch (error) {
      console.error('Error fetching departments:', error)
      throw error
    }
  },

  // Get staff statistics
  async getStaffStatistics() {
    try {
      const response = await apiClient.get('/staff/statistics')
      return response.data
    } catch (error) {
      console.error('Error fetching staff statistics:', error)
      throw error
    }
  },

  // Get staff status options
  getStatusOptions() {
    return [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'INACTIVE', label: 'Inactive' },
      { value: 'ON_LEAVE', label: 'On Leave' },
      { value: 'SUSPENDED', label: 'Suspended' },
      { value: 'TERMINATED', label: 'Terminated' }
    ]
  },

  // Get contract type options
  getContractTypeOptions() {
    return [
      { value: 'PERMANENT', label: 'Permanent' },
      { value: 'TEMPORARY', label: 'Temporary' },
      { value: 'CONTRACT', label: 'Contract' },
      { value: 'PART_TIME', label: 'Part Time' },
      { value: 'INTERNSHIP', label: 'Internship' }
    ]
  },

  // Format staff for display
  formatStaffForDisplay(staff) {
    return {
      ...staff,
      fullName: staff.fullName || `${staff.firstName} ${staff.lastName}`,
      statusDisplay: this.getStatusDisplay(staff.status),
      contractDisplay: this.getContractDisplay(staff.contractType),
      joinDateFormatted: staff.joinDate ? new Date(staff.joinDate).toLocaleDateString() : 'N/A'
    }
  },

  // Get status display name
  getStatusDisplay(status) {
    const statusOptions = this.getStatusOptions()
    const option = statusOptions.find(opt => opt.value === status)
    return option ? option.label : status
  },

  // Get contract type display name
  getContractDisplay(contractType) {
    const contractOptions = this.getContractTypeOptions()
    const option = contractOptions.find(opt => opt.value === contractType)
    return option ? option.label : contractType
  },

  // Generate staff ID (client-side fallback)
  generateStaffId(department) {
    const deptCode = department && department.length >= 3 ? 
      department.substring(0, 3).toUpperCase() : 'STF'
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 999) + 1
    return `${deptCode}${year}${String(random).padStart(3, '0')}`
  }
}