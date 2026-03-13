import React, { useState, useRef, useEffect } from 'react'
import { BellIcon, MagnifyingGlassIcon, ChevronDownIcon, UserIcon, CogIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const portalBase = location.pathname.startsWith('/teacher') ? '/teacher' : location.pathname.startsWith('/admin') ? '/admin' : location.pathname.startsWith('/student') ? '/student' : ''
  const activePortal = portalBase === '/teacher' ? 'teacher' : portalBase === '/student' ? 'student' : portalBase === '/admin' ? 'admin' : 'default'
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getRoleDisplay = (role) => {
    switch(role) {
      case 'ADMIN': return 'Administrator'
      case 'HEAD_TEACHER': return 'Head Teacher'
      case 'TEACHER': return 'Teacher'
      case 'STUDENT': return 'Student'
      case 'DIRECTOR_OF_STUDIES': return 'Director of Studies'
      case 'CLASS_TEACHER': return 'Class Teacher'
      default: return role
    }
  }

  const portalRoleDisplay = activePortal === 'teacher'
    ? 'Teacher'
    : activePortal === 'student'
    ? 'Student'
    : activePortal === 'admin'
    ? 'Administrator'
    : getRoleDisplay(user?.roles?.[0] || user?.role || 'ADMIN')

  const portalWelcomeMessage = activePortal === 'teacher'
    ? 'Welcome to your teacher workspace. Here is your class and teaching overview.'
    : activePortal === 'student'
    ? 'Welcome to your student workspace. Here is your learning overview for today.'
    : activePortal === 'admin'
    ? 'Welcome to your administration workspace. Here is the latest school overview.'
    : 'Welcome to your dashboard. Here is what is happening today.'

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Sign Out?',
      text: 'Are you sure you want to sign out of your account?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0ea5e9',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Sign Out',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'rounded-lg font-medium',
        cancelButton: 'rounded-lg font-medium'
      }
    })

    if (result.isConfirmed) {
      try {
        setDropdownOpen(false)
        await logout()
        Swal.fire({
          title: 'Signed Out!',
          text: 'You have been successfully signed out.',
          icon: 'success',
          confirmButtonColor: '#0ea5e9',
          timer: 2000,
          timerProgressBar: true,
          customClass: {
            popup: 'rounded-xl',
            confirmButton: 'rounded-lg font-medium'
          }
        })
      } catch (error) {
        console.error('Logout failed:', error)
        Swal.fire({
          title: 'Error!',
          text: 'Failed to sign out. Please try again.',
          icon: 'error',
          confirmButtonColor: '#0ea5e9',
          customClass: {
            popup: 'rounded-xl',
            confirmButton: 'rounded-lg font-medium'
          }
        })
      }
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {getGreeting()}, {user?.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : portalRoleDisplay}!
          </h1>
          <p className="text-gray-600 mt-1">{portalWelcomeMessage}</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Notifications */}
          <button onClick={() => navigate(`${portalBase}/notifications`)} className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <div className="w-9 h-9 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold text-sm shadow-lg">
                {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{portalRoleDisplay}</p>
              </div>
              <ChevronDownIcon 
                className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                >
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold shadow-lg">
                        {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {user?.email}
                        </p>
                        <p className="text-xs text-primary-600 font-medium">{portalRoleDisplay}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                          navigate(`${portalBase}/profile`)
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
                      View Profile
                    </button>
                    
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                          navigate(`${portalBase}/settings`)
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <CogIcon className="w-4 h-4 mr-3 text-gray-400" />
                      Settings
                    </button>
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header