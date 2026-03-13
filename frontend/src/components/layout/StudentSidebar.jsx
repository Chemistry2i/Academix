import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ClockIcon,
  SpeakerWaveIcon,
  BellIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import Swal from 'sweetalert2'

const StudentSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/student/dashboard',
      icon: HomeIcon
    },
    {
      name: 'My Courses',
      href: '/student/courses',
      icon: AcademicCapIcon
    },
    {
      name: 'Enrollment',
      href: '/student/enrollment',
      icon: DocumentTextIcon
    },
    {
      name: 'Results',
      href: '/student/results',
      icon: ChartBarIcon
    },
    {
      name: 'Assignments',
      href: '/student/assignments',
      icon: ClipboardDocumentCheckIcon
    },
    {
      name: 'Timetable',
      href: '/student/timetable',
      icon: CalendarIcon
    },
    {
      name: 'Attendance',
      href: '/student/attendance',
      icon: ClockIcon
    },
    {
      name: 'Library',
      href: '/student/library',
      icon: BookOpenIcon
    },
    {
      name: 'Profile',
      href: '/student/profile',
      icon: UserCircleIcon
    },
    {
      name: 'Announcements',
      href: '/student/announcements',
      icon: SpeakerWaveIcon
    },
    {
      name: 'Notifications',
      href: '/student/notifications',
      icon: BellIcon
    },
    {
      name: 'Settings',
      href: '/student/settings',
      icon: Cog6ToothIcon
    }
  ]

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to log out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, log out',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      await logout()
      navigate('/login')
    }
  }

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <div className="bg-primary-600 p-2 rounded-lg mr-3">
                  <AcademicCapIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 font-outfit">Academix</h1>
                  <p className="text-xs text-gray-500">Student Portal</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-5 h-5 flex flex-col justify-between">
              <div className="w-full h-0.5 bg-gray-600"></div>
              <div className="w-full h-0.5 bg-gray-600"></div>
              <div className="w-full h-0.5 bg-gray-600"></div>
            </div>
          </button>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium text-sm">
              {user?.firstName?.[0]?.toUpperCase() || 'S'}
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3 flex-1 min-w-0"
                >
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">Student</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href === '/student/dashboard' && location.pathname === '/dashboard')

            return (
              <Link key={item.name} to={item.href}>
                <motion.div
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded transition-all duration-200
                    ${isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className={`
                    flex-shrink-0 w-5 h-5
                    ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}
                  `} />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="ml-3"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default StudentSidebar