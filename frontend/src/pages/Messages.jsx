import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ChatBubbleLeftRightIcon, 
  PlusIcon,
  EnvelopeIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'

const Messages = () => {
  const [filter, setFilter] = useState('all')

  const mockMessages = [
    {
      id: 1,
      subject: 'Parent-Teacher Meeting Schedule',
      from: 'Dr. Sarah Johnson',
      to: 'Grade 10A Parents',
      timestamp: '2026-03-09 10:30 AM',
      status: 'Sent',
      priority: 'High',
      type: 'Announcement'
    },
    {
      id: 2,
      subject: 'Assignment Submission Reminder',
      from: 'Prof. Mike Wilson',
      to: 'Grade 11B Students',
      timestamp: '2026-03-09 09:15 AM',
      status: 'Sent',
      priority: 'Medium',
      type: 'Reminder'
    },
    {
      id: 3,
      subject: 'Science Fair Registration Open',
      from: 'Admin Office',
      to: 'All Students',
      timestamp: '2026-03-08 02:45 PM',
      status: 'Sent',
      priority: 'Low',
      type: 'Announcement'
    },
    {
      id: 4,
      subject: 'Library Book Return Notice',
      from: 'Librarian',
      to: 'Alice Johnson',
      timestamp: '2026-03-08 11:20 AM',
      status: 'Read',
      priority: 'Medium',
      type: 'Notice'
    }
  ]

  const stats = [
    { title: 'Total Messages', value: '1,247', change: '+89', trend: 'up' },
    { title: 'Unread Messages', value: '23', change: '+5', trend: 'up' },
    { title: 'Sent Today', value: '45', change: '+12', trend: 'up' },
    { title: 'Response Rate', value: '87%', change: '+3%', trend: 'up' }
  ]

  const columns = [
    { 
      key: 'subject', 
      header: 'Subject',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{row.type}</p>
        </div>
      )
    },
    { key: 'from', header: 'From' },
    { key: 'to', header: 'To' },
    { key: 'timestamp', header: 'Time' },
    { 
      key: 'priority', 
      header: 'Priority',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'High' ? 'bg-red-100 text-red-800' :
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
          value === 'Sent' ? 'bg-blue-100 text-blue-800' :
          value === 'Read' ? 'bg-green-100 text-green-800' :
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
          <Button size="sm" variant="outline">Reply</Button>
          <Button size="sm" variant="ghost">View</Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communication between teachers, students, and staff</p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Compose Message
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

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
            <div className="flex gap-2">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Messages</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
                <option value="unread">Unread</option>
              </select>
            </div>
          </div>
          <DataTable
            data={mockMessages}
            columns={columns}
            searchPlaceholder="Search messages..."
          />
        </div>
      </Card>
    </div>
  )
}

export default Messages