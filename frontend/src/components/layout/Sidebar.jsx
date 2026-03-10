import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  UserCircleIcon,
  DocumentChartBarIcon,
  SpeakerWaveIcon,
  UsersIcon,
  BuildingOffice2Icon,
  UserPlusIcon,
  PencilSquareIcon,
  CalendarDaysIcon,
  RectangleStackIcon,
  CubeIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import Swal from 'sweetalert2'

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, logout, hasAnyRole } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: HomeIcon
    },
    {
      name: 'Students',
      href: '/admin/students',
      icon: AcademicCapIcon
    },
    {
      name: 'Teachers',
      href: '/admin/teachers',
      icon: UserGroupIcon
    },
    {
      name: 'Staff',
      href: '/admin/staff',
      icon: UsersIcon
    },
    {
      name: 'Admissions',
      href: '/admin/admissions',
      icon: UserPlusIcon
    },
    {
      name: 'Courses',
      href: '/admin/courses',
      icon: BookOpenIcon
    },
    {
      name: 'Classes',
      href: '/admin/classes',
      icon: RectangleStackIcon
    },
    {
      name: 'Departments',
      href: '/admin/departments',
      icon: BuildingOffice2Icon
    },
    {
      name: 'Assignments',
      href: '/admin/assignments',
      icon: PencilSquareIcon
    },
    {
      name: 'Results',
      href: '/admin/results',
      icon: ChartBarIcon
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: DocumentChartBarIcon
    },
    {
      name: 'Timetable',
      href: '/admin/timetable',
      icon: CalendarIcon
    },
    {
      name: 'Events',
      href: '/admin/events',
      icon: CalendarDaysIcon
    },
    {
      name: 'Attendance',
      href: '/admin/attendance',
      icon: ClipboardDocumentCheckIcon
    },
    {
      name: 'Exams',
      href: '/admin/exams',
      icon: DocumentTextIcon
    },
    {
      name: 'Announcements',
      href: '/admin/announcements',
      icon: SpeakerWaveIcon
    },
    {
      name: 'Profile',
      href: '/admin/profile',
      icon: UserCircleIcon
    },
    {
      name: 'Subjects',
      href: '/admin/subjects',
      icon: CubeIcon,
      description: 'Manage academic subjects'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Cog6ToothIcon
    }
  ]

  // Use all navigation items without role filtering for development
  const filteredNavigation = navigation

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel',
      customClass: {
        container: 'font-outfit',
        popup: 'rounded-xl',
        confirmButton: 'rounded-lg px-4 py-2',
        cancelButton: 'rounded-lg px-4 py-2'
      }
    })

    if (result.isConfirmed) {
      await logout()
    }
  }

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
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
                  <p className="text-xs text-gray-500">School Management</p>
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

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium text-sm">
              {user?.firstName?.[0]?.toUpperCase()}
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
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role?.toLowerCase() || 'User'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href
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

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <motion.button
            onClick={handleLogout}
            className="w-full group flex items-center px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowRightOnRectangleIcon className="flex-shrink-0 w-5 h-5 text-red-500" />
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

export default Sidebar