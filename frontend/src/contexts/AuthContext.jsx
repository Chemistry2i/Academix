import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authService } from '../services/authService'
import { tokenService } from '../services/tokenService'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  // Development bypass - set to true to skip authentication
  // TODO: Set to false for production deployment
  const DEV_BYPASS_AUTH = true

  // Check authentication status on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Development bypass
        if (DEV_BYPASS_AUTH) {
          const mockUser = {
            id: 1,
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@academix.com',
            role: 'ADMIN',
            roles: ['ADMIN'],
            isActive: true,
            emailVerified: true
          }
          setUser(mockUser)
          setIsAuthenticated(true)
          setIsLoading(false)
          return
        }

        const token = tokenService.getAccessToken()
        if (token) {
          // Verify token validity and get user info
          const userInfo = await authService.getCurrentUser()
          if (userInfo.success) {
            setUser(userInfo.data)
            setIsAuthenticated(true)
          } else {
            // Token might be expired
            await logout()
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        await logout()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (credentials) => {
    try {
      setIsLoading(true)
      
      // Development bypass - simulate successful login
      if (DEV_BYPASS_AUTH) {
        const mockUser = {
          id: 1,
          firstName: 'Admin',
          lastName: 'User',
          email: credentials.email || 'admin@academix.com',
          role: 'ADMIN',
          roles: ['ADMIN'],
          isActive: true,
          emailVerified: true
        }
        setUser(mockUser)
        setIsAuthenticated(true)
        toast.success(`Welcome back, ${mockUser.firstName}!`)
        navigate('/dashboard')
        return { success: true }
      }
      
      const response = await authService.login(credentials)
      
      if (response.success) {
        const { accessToken, refreshToken, user: userData } = response.data
        
        // Store tokens
        tokenService.setTokens(accessToken, refreshToken)
        
        // Set user state
        setUser(userData)
        setIsAuthenticated(true)
        
        toast.success(`Welcome back, ${userData.firstName}!`)
        navigate('/dashboard')
        
        return { success: true }
      } else {
        toast.error(response.message || 'Login failed')
        return { success: false, message: response.message }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.'
      toast.error(message)
      return { success: false, message }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Skip API call if in dev bypass mode
      if (!DEV_BYPASS_AUTH) {
        await authService.logout()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local state regardless of API call result
      tokenService.clearTokens()
      setUser(null)
      setIsAuthenticated(false)
      navigate('/login')
      toast.success('Logged out successfully')
    }
  }

  const refreshAuth = async () => {
    try {
      const refreshToken = tokenService.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await authService.refreshToken(refreshToken)
      if (response.success) {
        const { accessToken, refreshToken: newRefreshToken } = response.data
        tokenService.setTokens(accessToken, newRefreshToken)
        return true
      } else {
        throw new Error('Token refresh failed')
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      await logout()
      return false
    }
  }

  const hasRole = (role) => {
    return user?.role?.toLowerCase() === role.toLowerCase()
  }

  const hasAnyRole = (roles) => {
    return roles.some(role => hasRole(role))
  }

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshAuth,
    hasRole,
    hasAnyRole,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}