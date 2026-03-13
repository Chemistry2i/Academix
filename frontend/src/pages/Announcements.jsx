import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { 
  SpeakerWaveIcon, 
  PlusIcon,
  MegaphoneIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'

const Announcements = () => {
  const [filter, setFilter] = useState('active')
  const location = useLocation()
  const isTeacherPortal = location.pathname.startsWith('/teacher')
  const isStudentPortal = location.pathname.startsWith('/student')
  const canManageAnnouncements = !isTeacherPortal && !isStudentPortal

  const mockAnnouncements = [
    {
      id: 1,
      title: 'School Closure Due to Weather',
      content: 'Due to severe weather conditions, the school will be closed tomorrow...',
      author: 'Principal Office',
      audience: 'All Students & Staff',
      priority: 'Urgent',
      status: 'Published',
      publishDate: '2026-03-09 08:00 AM',
      expires: '2026-03-10',
      views: 157
    },
    {
      id: 2,
      title: 'Annual Science Fair Registration',
      content: 'Registration for the annual science fair is now open...',
      author: 'Science Department',
      audience: 'Grade 9-12 Students',
      priority: 'High',
      status: 'Published',
      publishDate: '2026-03-08 02:00 PM',
      expires: '2026-03-20',
      views: 89
    },
    {
      id: 3,
      title: 'Library Extended Hours',
      content: 'The library will be open until 8 PM starting next week...',
      author: 'Library Staff',
      audience: 'All Students',
      priority: 'Medium',
      status: 'Published',
      publishDate: '2026-03-08 10:30 AM',
      expires: '2026-03-15',
      views: 43
    },
    {
      id: 4,
      title: 'Parent-Teacher Conference Notice',
      content: 'Parent-teacher conferences are scheduled for next month...',
      author: 'Admin Office',
      audience: 'Parents',
      priority: 'High',
      status: 'Draft',
      publishDate: null,
      expires: '2026-04-01',
      views: 0
    }
  ]

  const stats = [
    { title: 'Total Announcements', value: '24', change: '+6', trend: 'up' },
    { title: 'Active Announcements', value: '18', change: '+3', trend: 'up' },
    { title: 'Total Views', value: '2,847', change: '+234', trend: 'up' },
    { title: 'Avg. Engagement', value: '78%', change: '+5%', trend: 'up' }
  ]

  const columns = [
    { 
      key: 'title', 
      header: 'Announcement',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 truncate max-w-xs">{row.content}</p>
        </div>
      )
    },
    { key: 'author', header: 'Author' },
    { key: 'audience', header: 'Target Audience' },
    { 
      key: 'priority', 
      header: 'Priority',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Urgent' ? 'bg-red-100 text-red-800' :
          value === 'High' ? 'bg-orange-100 text-orange-800' :
          value === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Published' ? 'bg-green-100 text-green-800' :
          value === 'Draft' ? 'bg-gray-100 text-gray-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: 'views', 
      header: 'Views',
      render: (value) => (
        <div className="flex items-center gap-1">
          <EyeIcon className="h-4 w-4 text-gray-500" />
          <span>{value}</span>
        </div>
      )
    },
    { key: 'expires', header: 'Expires' },
    { 
      key: 'actions', 
      header: 'Actions',
      render: () => (
        <div className="flex gap-2">
          {canManageAnnouncements && <Button size="sm" variant="outline">Edit</Button>}
          <Button size="sm" variant="ghost">View</Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">{canManageAnnouncements ? 'Manage school-wide announcements and notices' : 'School-wide announcements and notices'}</p>
        </div>
        {canManageAnnouncements && (
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              Create Announcement
            </Button>
          )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      {canManageAnnouncements && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <MegaphoneIcon className="h-8 w-8 text-red-600 mb-2 mx-auto" />
                <p className="font-medium text-gray-900">Urgent Notice</p>
                <p className="text-sm text-gray-600">High priority announcement</p>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <SpeakerWaveIcon className="h-8 w-8 text-primary-600 mb-2 mx-auto" />
                <p className="font-medium text-gray-900">General Notice</p>
                <p className="text-sm text-gray-600">Standard announcement</p>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <ClockIcon className="h-8 w-8 text-primary-600 mb-2 mx-auto" />
                <p className="font-medium text-gray-900">Event Notice</p>
                <p className="text-sm text-gray-600">Event-related announcement</p>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <EyeIcon className="h-8 w-8 text-primary-600 mb-2 mx-auto" />
                <p className="font-medium text-gray-900">View Analytics</p>
                <p className="text-sm text-gray-600">Announcement performance</p>
              </motion.button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">All Announcements</h3>
            <div className="flex gap-2">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="expired">Expired</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
          <DataTable
            data={mockAnnouncements}
            columns={columns}
            searchPlaceholder="Search announcements..."
          />
        </div>
      </Card>
    </div>
  )
}

export default Announcements