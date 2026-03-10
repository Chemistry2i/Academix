import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BellIcon, PlusIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'

const Notifications = () => {
  const [notifications] = useState([
    {
      id: 1,
      title: 'New Student Enrollment',
      message: 'A new student has been enrolled in S.6 Science class.',
      type: 'info',
      time: '2 minutes ago',
      read: false
    },
    {
      id: 2,
      title: 'Fee Payment Reminder',
      message: 'Multiple students have pending fee payments due this week.',
      type: 'warning',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      title: 'System Maintenance',
      message: 'Scheduled system maintenance completed successfully.',
      type: 'success',
      time: '3 hours ago',
      read: true
    }
  ])

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
          <p className="text-gray-600 mt-1">Manage system notifications and announcements</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <PlusIcon className="w-4 h-4 mr-2" />
          Send Notification
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <BellIcon className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
          </div>
          
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.read ? 'bg-gray-50 border-gray-200' : getNotificationBg(notification.type)
                }`}
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