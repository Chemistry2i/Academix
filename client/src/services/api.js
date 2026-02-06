// Academix - API Client (Axios instance)
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS } from '../config/constants';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add school ID if available
    const schoolId = localStorage.getItem(STORAGE_KEYS.SCHOOL_ID);
    if (schoolId) {
      config.headers['X-School-ID'] = schoolId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle specific error codes
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - Clear auth and redirect to login
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
          localStorage.removeItem(STORAGE_KEYS.SCHOOL_ID);
          
          // Don't redirect if already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;

        case 403:
          // Forbidden - User doesn't have permission
          console.error('Access denied:', data.message);
          break;

        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;

        case 422:
          // Validation error
          console.error('Validation error:', data.errors);
          break;

        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;

        default:
          console.error('API Error:', data.message);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - no response received');
    } else {
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

// API helper methods
export const api = {
  get: (url, params = {}, config = {}) => 
    apiClient.get(url, { params, ...config }),

  post: (url, data = {}, config = {}) => 
    apiClient.post(url, data, config),

  put: (url, data = {}, config = {}) => 
    apiClient.put(url, data, config),

  patch: (url, data = {}, config = {}) => 
    apiClient.patch(url, data, config),

  delete: (url, config = {}) => 
    apiClient.delete(url, config),

  // File upload
  upload: (url, formData, onProgress) => 
    apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentage);
        }
      },
    }),

  // Download file
  download: async (url, filename) => {
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });
    
    const blob = new Blob([response]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
  },
};

export default apiClient;
