import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  UserCircleIcon, 
  PlusIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CalendarIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'

const ParentPortal = () => {
  const [filter, setFilter] = useState('active')

  const mockParentAccounts = [
    {
      id: 1,
      parentName: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 234-567-8901',
      children: ['Alice Smith (Grade 10A)', 'Bob Smith (Grade 8B)'],
      lastLogin: '2026-03-09 09:30 AM',
      status: 'Active',
      notifications: 3
    },
    {
      id: 2,
      parentName: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      phone: '+1 234-567-8902',
      children: ['Carlos Garcia (Grade 11A)'],
      lastLogin: '2026-03-08 07:45 PM',
      status: 'Active',
      notifications: 1
    },
    {
      id: 3,
      parentName: 'David Johnson',
      email: 'david.johnson@email.com',
      phone: '+1 234-567-8903',
      children: ['Emma Johnson (Grade 9C)', 'Luke Johnson (Grade 12A)'],
      lastLogin: '2026-03-07 06:20 PM',
      status: 'Active',
      notifications: 5
    },
    {
      id: 4,
      parentName: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      phone: '+1 234-567-8904',
      children: ['Michael Wilson (Grade 10B)'],
      lastLogin: '2026-03-05 02:15 PM',
      status: 'Inactive',
      notifications: 0
    }
  ]

  const stats = [
    { title: 'Registered Parents', value: '387', change: '+12', trend: 'up' },
    { title: 'Active Accounts', value: '342', change: '+8', trend: 'up' },
    { title: 'Login Rate (30d)', value: '78%', change: '+3%', trend: 'up' },
    { title: 'Avg. Session Time', value: '12 min', change: '+2 min', trend: 'up' }
  ]

  const recentActivity = [
    {
      parent: 'John Smith',
      activity: 'Viewed Grade Report',
      child: 'Alice Smith',
      time: '10 minutes ago'
    },
    {
      parent: 'Maria Garcia',
      activity: 'Downloaded Assignment',
      child: 'Carlos Garcia',
      time: '1 hour ago'
    },
    {
      parent: 'David Johnson',
      activity: 'Scheduled Meeting',
      child: 'Emma Johnson',
      time: '2 hours ago'
    }
  ]

  const columns = [
    { 
      key: 'parentName', 
      header: 'Parent',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{row.email}</p>
        </div>
      )
    },
    { 
      key: 'children', 
      header: 'Children',
      render: (value) => (
        <div>
          {value.map((child, index) => (
            <p key={index} className="text-sm text-gray-700">{child}</p>
          ))}
        </div>
      )
    },
    { key: 'phone', header: 'Phone' },
    { key: 'lastLogin', header: 'Last Login' },
    { 
      key: 'notifications', 
      header: 'Notifications',
      render: (value) => (
        <div className="flex items-center gap-1">
          <BellIcon className="h-4 w-4 text-gray-500" />
          <span className={`px-2 py-1 rounded-full text-xs ${
            value > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
          }`}>
            {value}
          </span>
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Active' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: 'actions', 
      header: 'Actions',
      render: () => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Message</Button>
          <Button size="sm" variant="ghost">View</Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parent Portal</h1>
          <p className="text-gray-600">Manage parent access and communication</p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Add Parent Account
        </Button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <UserCircleIcon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{activity.parent}</p>
                      <p className="text-sm text-gray-600">{activity.activity}</p>
                      <p className="text-xs text-gray-500">Child: {activity.child}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Portal Features */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Portal Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <ChartBarIcon className="h-8 w-8 text-primary-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Grade Reports</p>
                  <p className="text-sm text-gray-600">View student grades</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <CalendarIcon className="h-8 w-8 text-primary-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Attendance</p>
                  <p className="text-sm text-gray-600">Track attendance</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <AcademicCapIcon className="h-8 w-8 text-primary-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Assignments</p>
                  <p className="text-sm text-gray-600">View homework</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <BellIcon className="h-8 w-8 text-primary-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Notifications</p>
                  <p className="text-sm text-gray-600">School updates</p>
                </motion.button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">All Parent Accounts</h3>
            <div className="flex gap-2">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="all">All Parents</option>
              </select>
            </div>
          </div>
          <DataTable
            data={mockParentAccounts}
            columns={columns}
            searchPlaceholder="Search parent accounts..."
          />
        </div>
      </Card>
    </div>
  )
}

export default ParentPortal