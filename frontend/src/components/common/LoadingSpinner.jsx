import React from 'react'
import { motion } from 'framer-motion'

const LoadingSpinner = ({ 
  size = 'default', 
  message = 'Loading...', 
  fullScreen = false,
  className = '',
  showMessage = true 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  const borderClasses = {
    xs: 'border-2',
    sm: 'border-2', 
    small: 'border-2',
    default: 'border-4',
    large: 'border-4'
  }

  const spinnerElement = (
    <motion.div
      className={`${sizeClasses[size]} ${borderClasses[size]} border-primary-200 border-t-primary-600 rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  )

  // Full screen loading overlay
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4">
            {spinnerElement}
          </div>
          {showMessage && (
            <p className="text-gray-600 font-medium">{message}</p>
          )}
        </div>
      </div>
    )
  }

  // Inline spinner (for buttons, etc.)
  return spinnerElement
}

export default LoadingSpinner
