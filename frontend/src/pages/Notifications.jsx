import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { BellIcon, PlusIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { useAuth } from '../contexts/AuthContext'
import { studentService } from '../services/studentService'
import { assignmentService } from '../services/assignmentService'
import { resultsService } from '../services/resultsService'

const Notifications = () => {
  const { user, hasAnyRole } = useAuth()
  const location = useLocation()
  const isStudentPortal = location.pathname.startsWith('/student')
  const canSendNotifications = !isStudentPortal && hasAnyRole(['ADMIN'])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const readStorageKey = `academix.notifications.read.${user?.email || 'anonymous'}.${isStudentPortal ? 'student' : 'staff'}`
  const filterStorageKey = `academix.notifications.filter.${user?.email || 'anonymous'}.${isStudentPortal ? 'student' : 'staff'}`

  const loadReadIds = () => {
    try {
      const raw = window.localStorage.getItem(readStorageKey)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const saveReadIds = (ids = []) => {
    try {
      window.localStorage.setItem(readStorageKey, JSON.stringify(ids))
    } catch {
      // Ignore storage write failures
    }
  }

  const applyReadState = (items = []) => {
    const readIds = new Set(loadReadIds())
    return items.map((item) => ({ ...item, read: item.read || readIds.has(String(item.id)) }))
  }

  const loadFilterPreference = () => {
    try {
      return window.localStorage.getItem(filterStorageKey) === 'unread'
    } catch {
      return false
    }
  }

  const saveFilterPreference = (unreadOnly) => {
    try {
      window.localStorage.setItem(filterStorageKey, unreadOnly ? 'unread' : 'all')
    } catch {
      // Ignore storage write failures
    }
  }

  useEffect(() => {
    setShowUnreadOnly(loadFilterPreference())
  }, [filterStorageKey])

  const formatRelativeTime = (dateValue) => {
    const timestamp = new Date(dateValue).getTime()
    if (Number.isNaN(timestamp)) return 'Recently'

    const diffMs = Date.now() - timestamp
    const minutes = Math.floor(diffMs / (1000 * 60))
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const buildStudentNotifications = ({ assignments = [], transcript = {} }) => {
    const rows = []

    const pendingAssignments = assignments.filter((item) => item.submissionStatus === 'pending')
    const overdueAssignments = pendingAssignments.filter((item) => item.state === 'overdue')
    const reviewedAssignments = assignments
      .filter((item) => item.submissionStatus === 'reviewed')
      .sort((left, right) => new Date(right.reviewedAt || 0).getTime() - new Date(left.reviewedAt || 0).getTime())

    overdueAssignments.slice(0, 3).forEach((item) => {
      rows.push({
        id: `overdue-${item.id}`,
        title: `Assignment overdue: ${item.title}`,
        message: `${item.subjectName || 'Subject'} assignment is overdue. Submit immediately to avoid penalties.`,
        type: 'warning',
        time: formatRelativeTime(item.dueDate),
        read: false,
        createdAt: item.dueDate
      })
    })

    pendingAssignments
      .filter((item) => item.state !== 'overdue')
      .slice(0, 3)
      .forEach((item) => {
        rows.push({
          id: `pending-${item.id}`,
          title: `Upcoming deadline: ${item.title}`,
          message: `${item.subjectName || 'Subject'} is due on ${new Date(item.dueDate).toLocaleDateString()}.`,
          type: 'info',
          time: formatRelativeTime(item.createdAt || item.dueDate),
          read: false,
          createdAt: item.createdAt || item.dueDate
        })
      })

    reviewedAssignments.slice(0, 2).forEach((item) => {
      rows.push({
        id: `reviewed-${item.id}`,
        title: `Feedback posted: ${item.title}`,
        message: item.feedback
          ? `Teacher feedback: ${item.feedback}`
          : 'Your submission has been reviewed.',
        type: 'success',
        time: formatRelativeTime(item.reviewedAt),
        read: false,
        createdAt: item.reviewedAt
      })
    })

    if (transcript?.summary?.averagePercentage) {
      rows.push({
        id: 'summary-average',
        title: 'Progress update',
        message: `Your current average is ${transcript.summary.averagePercentage}%. Keep up the momentum.`,
        type: 'info',
        time: 'Today',
        read: true,
        createdAt: new Date().toISOString()
      })
    }

    if (!rows.length) {
      rows.push({
        id: 'welcome-student-notifications',
        title: 'No urgent alerts right now',
        message: 'New assignment deadlines, feedback, and result updates will appear here.',
        type: 'success',
        time: 'Today',
        read: true,
        createdAt: new Date().toISOString()
      })
    }

    return rows.sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
  }

  useEffect(() => {
    const loadNotifications = async () => {
      if (!isStudentPortal) {
        setNotifications(applyReadState([
          {
            id: 1,
            title: 'System update complete',
            message: 'Platform update completed successfully. All modules are available.',
            type: 'success',
            time: '2h ago',
            read: false,
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            title: 'End of week reminder',
            message: 'Review pending announcements and publish required notices for next week.',
            type: 'info',
            time: 'Today',
            read: true,
            createdAt: new Date().toISOString()
          }
        ]))
        return
      }

      try {
        setLoading(true)
        const studentsPayload = await studentService.getStudents(true).catch(() => ({ students: [] }))
        const students = studentsPayload.students || studentsPayload.data || studentsPayload || []
        const matchedStudent = students.find((student) => {
          return String(student.email || '').toLowerCase() === String(user?.email || '').toLowerCase()
        })

        const studentContext = {
          studentId: matchedStudent?.id || '',
          studentEmail: user?.email || matchedStudent?.email || '',
          classId: matchedStudent?.schoolClass?.id || matchedStudent?.classId || '',
          className: matchedStudent?.schoolClass?.name || matchedStudent?.currentClass || ''
        }

        const [assignments, transcript] = await Promise.all([
          assignmentService.getPublishedAssignments({
            studentContext,
            classId: studentContext.classId || undefined,
            className: studentContext.className || undefined
          }).catch(() => []),
          matchedStudent?.id
            ? resultsService.getStudentTranscript({ studentId: matchedStudent.id }).catch(() => ({ summary: {} }))
            : Promise.resolve({ summary: {} })
        ])

        setNotifications(applyReadState(buildStudentNotifications({ assignments, transcript })))
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [isStudentPortal, user?.email])

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications])
  const filteredNotifications = useMemo(() => {
    return showUnreadOnly
      ? notifications.filter((item) => !item.read)
      : notifications
  }, [notifications, showUnreadOnly])

  useEffect(() => {
    const readIds = notifications.filter((item) => item.read).map((item) => String(item.id))
    saveReadIds(readIds)
  }, [notifications])

  useEffect(() => {
    saveFilterPreference(showUnreadOnly)
  }, [showUnreadOnly])

  const handleMarkAllAsRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
  }

  const handleMarkOneAsRead = (id) => {
    setNotifications((current) => current.map((item) => {
      if (String(item.id) !== String(id)) return item
      return { ...item, read: true }
    }))
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
      case 'success':
        return <InformationCircleIcon className="w-5 h-5 text-green-600" />
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-600" />
    }
  }

  const getNotificationBg = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'success':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {isStudentPortal
              ? 'Stay updated on assignment deadlines, grading feedback, and learning progress'
              : 'Manage system notifications and announcements'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setShowUnreadOnly((current) => !current)}>
            {showUnreadOnly ? 'Show All' : 'Unread Only'}
          </Button>
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            Mark All Read ({unreadCount})
          </Button>
          {canSendNotifications && (
            <Button className="bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <BellIcon className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
          </div>

          {loading && (
            <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Loading your latest notifications...
            </div>
          )}
          
          <div className="space-y-4">
            {!filteredNotifications.length && !loading && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                No notifications match the current filter.
              </div>
            )}
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleMarkOneAsRead(notification.id)}
                className={`p-4 rounded-lg border ${
                  notification.read ? 'bg-gray-50 border-gray-200' : getNotificationBg(notification.type)
                } cursor-pointer`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${
                        notification.read ? 'text-gray-600' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                    <p className={`mt-1 text-sm ${
                      notification.read ? 'text-gray-500' : 'text-gray-700'
                    }`}>
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default Notifications