// Academix - Authentication Context
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { STORAGE_KEYS } from '../config/constants';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER: 'LOAD_USER',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from storage on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);

        if (token && userData) {
          const user = JSON.parse(userData);
          
          // Verify token is still valid
          const response = await authService.getCurrentUser();
          
          if (response.success) {
            dispatch({
              type: AUTH_ACTIONS.LOAD_USER,
              payload: { user: response.data, token },
            });
          } else {
            // Token invalid, clear storage
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_DATA);
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Error loading auth:', error);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    loadStoredAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await authService.login(credentials);

      if (response.success) {
        const { user, token, dashboardUrl } = response.data;

        // Store in localStorage
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.SCHOOL_ID, user.schoolId || '');
        
        // Store user role for routing
        localStorage.setItem('userRole', user.role || 'USER');

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token },
        });

        // Return success with user data and dashboard URL for routing
        return { 
          success: true, 
          user, 
          dashboardUrl: dashboardUrl || authService.getDashboardUrl(user.role),
          userType: user.role 
        };
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: response.message || 'Login failed',
        });
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred during login';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear storage
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.SCHOOL_ID);

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  // Update user data
  const updateUser = useCallback((userData) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
    
    // Update localStorage
    const storedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA) || '{}');
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify({ ...storedUser, ...userData }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Forgot password
  const forgotPassword = useCallback(async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset email',
      };
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      const response = await authService.resetPassword(token, newPassword);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password',
      };
    }
  }, []);

  // Verify email
  const verifyEmail = useCallback(async (token) => {
    try {
      const response = await authService.verifyEmail(token);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify email',
      };
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password',
      };
    }
  }, []);

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    clearError,
    forgotPassword,
    resetPassword,
    verifyEmail,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
