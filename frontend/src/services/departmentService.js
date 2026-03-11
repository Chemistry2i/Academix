import apiClient from './apiClient';

const ENDPOINTS = {
  BASE: '/departments',
  STATISTICS: '/departments/statistics',
  ACTIVE: '/departments/active',
  SEARCH: '/departments/search',
  VALIDATION: '/departments/validation/name'
};

export const departmentService = {
  /**
   * Get all departments with optional search and status filters
   */
  getAllDepartments: async (searchParams = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (searchParams.search) {
        params.append('search', searchParams.search);
      }
      if (searchParams.status && searchParams.status !== 'all') {
        params.append('status', searchParams.status);
      }
      
      const queryString = params.toString();
      const url = queryString ? `${ENDPOINTS.BASE}?${queryString}` : ENDPOINTS.BASE;
      
      const response = await apiClient.get(url);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          total: response.data.total
        };
      } else {
        throw new Error('Failed to fetch departments');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch departments');
    }
  },

  /**
   * Get department statistics for dashboard
   */
  getDepartmentStatistics: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.STATISTICS);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error('Failed to fetch department statistics');
      }
    } catch (error) {
      console.error('Error fetching department statistics:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch department statistics');
    }
  },

  /**
   * Get only active departments
   */
  getActiveDepartments: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.ACTIVE);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          total: response.data.total
        };
      } else {
        throw new Error('Failed to fetch active departments');
      }
    } catch (error) {
      console.error('Error fetching active departments:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch active departments');
    }
  },

  /**
   * Get department by ID
   */
  getDepartmentById: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.BASE}/${id}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error('Failed to fetch department');
      }
    } catch (error) {
      console.error('Error fetching department:', error);
      if (error.response?.status === 404) {
        throw new Error('Department not found');
      }
      throw new Error(error.response?.data?.error || 'Failed to fetch department');
    }
  },

  /**
   * Create new department
   */
  createDepartment: async (departmentData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.BASE, departmentData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error('Failed to create department');
      }
    } catch (error) {
      console.error('Error creating department:', error);
      throw new Error(error.response?.data?.error || 'Failed to create department');
    }
  },

  /**
   * Update existing department
   */
  updateDepartment: async (id, departmentData) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.BASE}/${id}`, departmentData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error('Failed to update department');
      }
    } catch (error) {
      console.error('Error updating department:', error);
      if (error.response?.status === 404) {
        throw new Error('Department not found');
      }
      throw new Error(error.response?.data?.error || 'Failed to update department');
    }
  },

  /**
   * Delete department
   */
  deleteDepartment: async (id) => {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.BASE}/${id}`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message
        };
      } else {
        throw new Error('Failed to delete department');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      if (error.response?.status === 404) {
        throw new Error('Department not found');
      }
      if (error.response?.status === 409) {
        throw new Error('Cannot delete department with associated teachers, subjects, or staff');
      }
      throw new Error(error.response?.data?.error || 'Failed to delete department');
    }
  },

  /**
   * Set department head
   */
  setDepartmentHead: async (departmentId, teacherId) => {
    try {
      const response = await apiClient.post(`${ENDPOINTS.BASE}/${departmentId}/head/${teacherId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error('Failed to set department head');
      }
    } catch (error) {
      console.error('Error setting department head:', error);
      if (error.response?.status === 404) {
        throw new Error('Department or teacher not found');
      }
      throw new Error(error.response?.data?.error || 'Failed to set department head');
    }
  },

  /**
   * Remove department head
   */
  removeDepartmentHead: async (departmentId) => {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.BASE}/${departmentId}/head`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error('Failed to remove department head');
      }
    } catch (error) {
      console.error('Error removing department head:', error);
      if (error.response?.status === 404) {
        throw new Error('Department not found');
      }
      throw new Error(error.response?.data?.error || 'Failed to remove department head');
    }
  },

  /**
   * Advanced search departments
   */
  searchDepartments: async (searchParams = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (searchParams.term) {
        params.append('term', searchParams.term);
      }
      if (searchParams.status && searchParams.status !== 'all') {
        params.append('status', searchParams.status);
      }
      if (searchParams.building) {
        params.append('building', searchParams.building);
      }
      if (searchParams.establishedYear) {
        params.append('establishedYear', searchParams.establishedYear);
      }
      
      const queryString = params.toString();
      const url = queryString ? `${ENDPOINTS.SEARCH}?${queryString}` : ENDPOINTS.SEARCH;
      
      const response = await apiClient.get(url);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          total: response.data.total
        };
      } else {
        throw new Error('Failed to search departments');
      }
    } catch (error) {
      console.error('Error searching departments:', error);
      throw new Error(error.response?.data?.error || 'Failed to search departments');
    }
  },

  /**
   * Validate department name uniqueness
   */
  validateDepartmentName: async (name, excludeId = null) => {
    try {
      const params = new URLSearchParams();
      params.append('name', name);
      if (excludeId) {
        params.append('excludeId', excludeId);
      }
      
      const response = await apiClient.get(`${ENDPOINTS.VALIDATION}?${params.toString()}`);
      
      if (response.data.success) {
        return {
          success: true,
          isUnique: response.data.isUnique,
          message: response.data.message
        };
      } else {
        throw new Error('Failed to validate department name');
      }
    } catch (error) {
      console.error('Error validating department name:', error);
      throw new Error(error.response?.data?.error || 'Failed to validate department name');
    }
  },

  /**
   * Format 데이터 for DataTable component
   */
  formatDepartmentData: (departments) => {
    if (!Array.isArray(departments)) {
      return [];
    }

    return departments.map(department => ({
      id: department.id,
      name: department.name,
      head: department.head || 'Not Assigned',
      teachers: department.teachers || 0,
      subjects: department.subjects || 0,
      students: department.students || 0,
      staff: department.staff || 0,
      established: department.established || 'N/A',
      status: department.status || 'Active',
      description: department.description || '',
      building: department.building || '',
      floor: department.floor || '',
      officeRoom: department.officeRoom || '',
      phoneNumber: department.phoneNumber || '',
      email: department.email || '',
      annualBudget: department.annualBudget || 0,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt
    }));
  },

  /**
   * Calculate department statistics from data
   */
  calculateStatistics: (departments) => {
    if (!Array.isArray(departments) || departments.length === 0) {
      return {
        totalDepartments: 0,
        activeDepartments: 0,
        totalTeachers: 0,
        totalSubjects: 0
      };
    }

    const activeDepartments = departments.filter(dept => dept.status === 'Active');
    const totalTeachers = departments.reduce((sum, dept) => sum + (dept.teachers || 0), 0);
    const totalSubjects = departments.reduce((sum, dept) => sum + (dept.subjects || 0), 0);

    return {
      totalDepartments: departments.length,
      activeDepartments: activeDepartments.length,
      totalTeachers: totalTeachers,
      totalSubjects: totalSubjects
    };
  },

  /**
   * Department status options for dropdowns
   */
  getStatusOptions: () => [
    { label: 'All Departments', value: 'all' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
    { label: 'Suspended', value: 'SUSPENDED' }
  ],

  /**
   * Department creation/update validation rules
   */
  getValidationRules: () => ({
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Department name must be between 2 and 100 characters'
    },
    description: {
      maxLength: 500,
      message: 'Description must not exceed 500 characters'
    },
    establishedYear: {
      min: 1950,
      max: new Date().getFullYear(),
      message: `Established year must be between 1950 and ${new Date().getFullYear()}`
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    phoneNumber: {
      pattern: /^[\+]?[\d\s\-\(\)]+$/,
      message: 'Please enter a valid phone number'
    }
  })
};

export default departmentService;