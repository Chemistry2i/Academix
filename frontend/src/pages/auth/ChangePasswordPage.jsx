import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useNavigate, useLocation } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import { authService } from '../../services/authService'
import { useAuth } from '../../contexts/AuthContext'

const ChangePasswordPage = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const portalBase = location.pathname.startsWith('/teacher') ? '/teacher' : location.pathname.startsWith('/admin') ? '/admin' : ''
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm()

  const newPassword = watch('newPassword')

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const result = await authService.changePassword(data.currentPassword, data.newPassword)
      if (result.success) {
        setIsSuccess(true)
        toast.success(result.message || 'Password changed successfully')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-primary-600 p-3 rounded-xl mr-3">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Academix</h1>
            <p className="text-gray-600 text-sm">School Management System</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!isSuccess ? (
            <>
              {/* Back button */}
              <button
                  onClick={() => navigate(`${portalBase}/settings`)}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to settings
              </button>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Change Password
                </h2>
                <p className="text-gray-600">
                  Update your password to keep your account secure.
                </p>
                {user && (
                  <p className="text-sm text-gray-500 mt-2">
                    Logged in as: <span className="font-medium">{user.email}</span>
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className={`
                        input-field pr-10
                        ${errors.currentPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                      `}
                      placeholder="Enter current password"
                      {...register('currentPassword', {
                        required: 'Current password is required'
                      })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-red-600 text-sm mt-1">{errors.currentPassword.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`
                        input-field pr-10
                        ${errors.newPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                      `}
                      placeholder="Enter new password"
                      {...register('newPassword', {
                        required: 'New password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                          message: 'Password must contain uppercase, lowercase, number, and special character'
                        }
                      })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-600 text-sm mt-1">{errors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`
                        input-field pr-10
                        ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                      `}
                      placeholder="Confirm new password"
                      {...register('confirmPassword', {
                        required: 'Please confirm your new password',
                        validate: value =>
                          value === newPassword || 'Passwords do not match'
                      })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Changing Password...' : 'Change Password'}
                </Button>
              </form>

              {/* Password requirements */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-medium mb-2">Password requirements:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• At least 8 characters</li>
                  <li>• One uppercase letter</li>
                  <li>• One lowercase letter</li>
                  <li>• One number</li>
                  <li>• One special character (@$!%*?&)</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Password Changed Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your password has been updated successfully. Make sure to remember your new password.
              </p>
              <div className="space-y-3">
                <Button
                    onClick={() => navigate(`${portalBase}/dashboard`)}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
                <Button
                    onClick={() => navigate(`${portalBase}/settings`)}
                  variant="outline"
                  className="w-full"
                >
                  Back to Settings
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ChangePasswordPage