import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authService } from '../services/authService'
import { tokenService } from '../services/tokenService'

const AuthContext = createContext({})
const USER_STORAGE_KEY = 'academix_user'

const normalizeRole = (role) => String(role || '').trim().toUpperCase()

const normalizeUser = (user) => {
  if (!user) return null

  const role = normalizeRole(user.role || user.roles?.[0])
  const roles = Array.isArray(user.roles) && user.roles.length
    ? user.roles.map(normalizeRole).filter(Boolean)
    : role
      ? [role]
      : []

  return {
    ...user,
    id: user.id ?? user.userId ?? null,
    email: user.email || '',
    role,
    roles,
    fullName: user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    emailVerified: Boolean(user.emailVerified),
    isActive: user.isActive !== false
  }
}

const userFromToken = (token) => {
  const claims = tokenService.getTokenClaims(token)
  if (!claims) return null

  const role = normalizeRole(claims.role)
  return normalizeUser({
    id: claims.userId ?? null,
    email: claims.sub || claims.email || '',
    role,
    roles: role ? [role] : [],
    fullName: claims.fullName || '',
    emailVerified: true,
    isActive: true
  })
}

const readStoredUser = () => {
  try {
    const value = localStorage.getItem(USER_STORAGE_KEY)
    return value ? normalizeUser(JSON.parse(value)) : null
  } catch (error) {
    return null
  }
}

const writeStoredUser = (user) => {
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY)
    return
  }

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizeUser(user)))
}

export const getHomePathForRole = (role) => {
  const normalizedRole = normalizeRole(role)

  if (normalizedRole === 'STUDENT') {
    return '/student/dashboard'
  }

  if (['TEACHER', 'CLASS_TEACHER'].includes(normalizedRole)) {
    return '/teacher/dashboard'
  }

  if (['HEAD_TEACHER', 'DIRECTOR_OF_STUDIES', 'ADMIN'].includes(normalizedRole)) {
    return '/admin/dashboard'
  }

  return '/login'
}

export const getHomePathForUser = (user) => getHomePathForRole(user?.role || user?.roles?.[0])

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

  // Check authentication status on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = tokenService.getAccessToken()
        if (token) {
          if (tokenService.isTokenExpired(token)) {
            tokenService.clearTokens()
            writeStoredUser(null)
          } else {
            const storedUser = readStoredUser()
            const fallbackUser = storedUser || userFromToken(token)
            if (fallbackUser) {
              setUser(fallbackUser)
              setIsAuthenticated(true)
            }
          }
        } else {
          writeStoredUser(null)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        tokenService.clearTokens()
        writeStoredUser(null)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      
      if (response.success) {
        const { accessToken, refreshToken, user: userData } = response.data
        
        // Store tokens
        tokenService.setTokens(accessToken, refreshToken)
        
        // Set user state
        const normalizedUser = normalizeUser(userData)
        setUser(normalizedUser)
        setIsAuthenticated(true)
        writeStoredUser(normalizedUser)
        
        toast.success(`Welcome back, ${normalizedUser.fullName || normalizedUser.email}!`)
        navigate(getHomePathForUser(normalizedUser))
        
        return { success: true }
      } else {
        toast.error(response.message || 'Login failed')
        return { success: false, message: response.message }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.'
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local state regardless of API call result
      tokenService.clearTokens()
      writeStoredUser(null)
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
    const currentRoles = user?.roles?.length ? user.roles : [user?.role]
    return currentRoles.filter(Boolean).some((currentRole) => normalizeRole(currentRole) === normalizeRole(role))
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
    getHomePathForUser,
    getHomePathForRole,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}