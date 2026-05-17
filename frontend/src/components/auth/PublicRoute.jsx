import React from 'react'
import { Navigate } from 'react-router-dom'
import { getHomePathForUser, useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isAuthenticated) {
    return <Navigate to={getHomePathForUser(user)} replace />
  }

  return children
}