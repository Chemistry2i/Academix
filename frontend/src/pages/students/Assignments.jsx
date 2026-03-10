import React from 'react'
import { motion } from 'framer-motion'
import Card from '../../components/common/Card'
import DataTable from '../../components/common/DataTable'
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

const StudentAssignments = () => {
  const assignments = [
    {
      id: 1,
      title: 'Math Quiz Chapter 5',
      course: 'Mathematics',
      teacher: 'Mr. Anderson',
      dueDate: '2026-03-10',
      dueTime: '11:59 PM',
      status: 'pending',
      priority: 'high',
      type: 'Quiz',
      points: 50
    },
    {
      id: 2,
      title: 'History Essay: World War II',
      course: 'History',
      teacher: 'Mrs. Brown',
      dueDate: '2026-03-18',
      dueTime: '11:59 PM',
      status: 'pending',
      priority: 'medium',
      type: 'Essay',
      points: 100
    },
    {
      id: 3,
      title: 'Physics Lab Report',
      course: 'Physics',
      teacher: 'Dr. Smith',
      dueDate: '2026-03-20',
      dueTime: '11:59 PM',
      status: 'pending',
      priority: 'low',
      type: 'Lab Report',
      points: 75
    },
    {
      id: 4,
      title: 'English Literature Analysis',
      course: 'English Literature',
      teacher: 'Ms. Johnson',
      dueDate: '2026-03-05',
      dueTime: '11:59 PM',
      status: 'submitted',
      priority: 'medium',
      type: 'Analysis',
      points: 80,
      grade: 'B+'
    }
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Submitted
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            <ExclamationCircleIcon className="w-3 h-3 mr-1" />
            Overdue
          </span>
        )
      default:
        return null
    }
  }

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    }
    return <div className={`w-3 h-3 rounded-full ${colors[priority]}`}></div>
  }

  const columns = [
    { 
      key: 'priority', 
      header: 'Priority', 
      render: (value) => getPriorityBadge(value)
    },
    { key: 'title', header: 'Assignment', sortable: true },
    { key: 'course', header: 'Course', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    { 
      key: 'dueDate', 
      header: 'Due Date', 
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {new Date(value).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">{row.dueTime}</div>
        </div>
      )
    },
    { key: 'points', header: 'Points', sortable: true },
    { 
      key: 'status', 
      header: 'Status', 
      render: (value) => getStatusBadge(value)
    },
    { 
      key: 'grade', 
      header: 'Grade', 
      render: (value) => value ? (
        <span className="text-sm font-medium text-green-600">{value}</span>
      ) : '-'
    }
  ]

  const pendingCount = assignments.filter(a => a.status === 'pending').length
  const submittedCount = assignments.filter(a => a.status === 'submitted').length

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
            <p className="text-gray-600 mt-1">
              Track your assignments, deadlines, and submissions
            </p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{submittedCount}</div>
              <div className="text-sm text-gray-500">Submitted</div>
            </div>
          </div>
        </div>

        <Card>
          <DataTable
            data={assignments}
            columns={columns}
            searchable
            searchPlaceholder="Search assignments..."
          />
        </Card>
      </motion.div>
    </div>
  )
}

export default StudentAssignments