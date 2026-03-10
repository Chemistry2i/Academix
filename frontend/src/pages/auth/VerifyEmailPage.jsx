import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import { authService } from '../../services/authService'

const VerifyEmailPage = () => {
  const [verificationStatus, setVerificationStatus] = useState('verifying') // 'verifying', 'success', 'error'
  const [isResending, setIsResending] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (token) {
      verifyEmail()
    } else {
      setVerificationStatus('error')
    }
  }, [token])

  const verifyEmail = async () => {
    try {
      const result = await authService.verifyEmail(token)
      if (result.success) {
        setVerificationStatus('success')
        toast.success(result.message || 'Email verified successfully!')
      } else {
        setVerificationStatus('error')
        toast.error(result.message)
      }
    } catch (error) {
      setVerificationStatus('error')
      toast.error('Email verification failed')
    }
  }

  const resendVerification = async () => {
    setIsResending(true)
    try {
      const result = await authService.resendVerificationEmail(email)
      if (result.success) {
        toast.success(result.message || 'Verification email sent!')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  const renderVerifyingState = () => (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
        <motion.div
          className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Verifying your email
      </h2>
      <p className="text-gray-600">
        Please wait while we verify your email address...
      </p>
    </div>
  )

  const renderSuccessState = () => (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Email Verified!
      </h2>
      <p className="text-gray-600 mb-6">
        Your email has been successfully verified. You can now access all features of your account.
      </p>
      <div className="space-y-3">
        <Button
          onClick={() => navigate('/login')}
          className="w-full"
        >
          Continue to Login
        </Button>
        <Button
          onClick={() => navigate('/dashboard')}
          variant="outline"
          className="w-full"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  )

  const renderErrorState = () => (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Verification Failed
      </h2>
      <p className="text-gray-600 mb-6">
        {token 
          ? 'The verification link is invalid or has expired.'
          : 'No verification token provided.'
        }
        {email && (
          <span className="block mt-2">
            Email: <span className="font-medium text-gray-900">{email}</span>
          </span>
        )}
      </p>
      <div className="space-y-3">
        {email && (
          <Button
            onClick={resendVerification}
            className="w-full"
            isLoading={isResending}
            disabled={isResending}
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </Button>
        )}
        <Button
          onClick={() => navigate('/login')}
          variant="outline"
          className="w-full"
        >
          Back to Login
        </Button>
      </div>
    </div>
  )

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
          {verificationStatus === 'verifying' && renderVerifyingState()}
          {verificationStatus === 'success' && renderSuccessState()}
          {verificationStatus === 'error' && renderErrorState()}
        </div>
      </motion.div>
    </div>
  )
}

export default VerifyEmailPage