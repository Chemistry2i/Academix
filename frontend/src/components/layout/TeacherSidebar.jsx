import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  ChartBarIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  DocumentChartBarIcon,
  ClockIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import Swal from 'sweetalert2'

const TeacherSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/teacher/dashboard',
      icon: HomeIcon
    },
    {
      name: 'My Classes',
      href: '/teacher/classes',
      icon: UserGroupIcon
    },
    {
      name: 'Students',
      href: '/teacher/students',
      icon: AcademicCapIcon
    },
    {
      name: 'Gradebook',
      href: '/teacher/gradebook',
      icon: ChartBarIcon
    },
    {
      name: 'Assignments',
      href: '/teacher/assignments',
      icon: ClipboardDocumentCheckIcon
    },
    {
      name: 'Attendance',
      href: '/teacher/attendance',
      icon: ClockIcon
    },
    {
      name: 'Timetable',
      href: '/teacher/timetable',
      icon: CalendarIcon
    },
    {
      name: 'Exams',
      href: '/teacher/exams',
      icon: PencilSquareIcon
    },
    {
      name: 'Reports',
      href: '/teacher/reports',
      icon: DocumentChartBarIcon
    },
    {
      name: 'Library',
      href: '/teacher/library',
      icon: BookOpenIcon
    },
    {
      name: 'Profile',
      href: '/teacher/profile',
      icon: UserCircleIcon
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

  const sidebarVariants = {
    expanded: {
      width: '16rem',
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    },
    collapsed: {
      width: '4.5rem',
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  }

  const contentVariants = {
    expanded: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        delay: 0.1
      }
    },
    collapsed: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <motion.div
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      className="bg-white border-r border-gray-200 flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <AcademicCapIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Academix</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.div>
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 font-medium">
              {user?.firstName?.[0] || 'T'}
            </span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="flex-1 min-w-0"
              >
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-xs text-gray-500 truncate">Teacher</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href === '/teacher/dashboard' && location.pathname === '/dashboard')
            
            return (
              <Link key={item.name} to={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        variants={contentVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-6 border-t border-gray-200">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-700 rounded-lg hover:bg-red-50 transition-colors"
        >
          <ArrowRightOnRectangleIcon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  )
}

export default TeacherSidebar