import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  PencilSquareIcon, 
  PlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'

const Assignments = () => {
  const [filter, setFilter] = useState('all')

  const mockAssignments = [
    {
      id: 1,
      title: 'Mathematics Problem Set 5',
      subject: 'Mathematics',
      class: 'Grade 10A',
      dueDate: '2026-03-15',
      status: 'Active',
      submissions: '23/30',
      type: 'Homework'
    },
    {
      id: 2,
      title: 'English Essay: Climate Change',
      subject: 'English',
      class: 'Grade 11B',
      dueDate: '2026-03-20',
      status: 'Active',
      submissions: '18/25',
      type: 'Essay'
    },
    {
      id: 3,
      title: 'Science Lab Report',
      subject: 'Physics',
      class: 'Grade 12A',
      dueDate: '2026-03-12',
      status: 'Overdue',
      submissions: '20/28',
      type: 'Lab Report'
    },
    {
      id: 4,
      title: 'History Research Project',
      subject: 'History',
      class: 'Grade 9C',
      dueDate: '2026-03-25',
      status: 'Draft',
      submissions: '0/32',
      type: 'Project'
    }
  ]

  const stats = [
    { title: 'Total Assignments', value: '48', change: '+8', trend: 'up' },
    { title: 'Active Assignments', value: '24', change: '+3', trend: 'up' },
    { title: 'Pending Reviews', value: '156', change: '+12', trend: 'up' },
    { title: 'Average Score', value: '85%', change: '+2%', trend: 'up' }
  ]

  const columns = [
    { key: 'title', header: 'Assignment Title' },
    { key: 'subject', header: 'Subject' },
    { key: 'class', header: 'Class' },
    { key: 'type', header: 'Type' },
    { key: 'dueDate', header: 'Due Date' },
    { key: 'submissions', header: 'Submissions' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Active' ? 'bg-green-100 text-green-800' :
          value === 'Overdue' ? 'bg-red-100 text-red-800' :
          value === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
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
          <Button size="sm" variant="outline">Edit</Button>
          <Button size="sm" variant="ghost">View</Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600">Manage homework, projects, and assessments</p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Create Assignment
        </Button>
      </div>

      {/* Stats Cards */}
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
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
            >
              <DocumentTextIcon className="h-8 w-8 text-primary-600 mb-2" />
              <p className="font-medium text-gray-900">Create Homework</p>
              <p className="text-sm text-gray-600">Regular homework assignment</p>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
            >
              <PencilSquareIcon className="h-8 w-8 text-primary-600 mb-2" />
              <p className="font-medium text-gray-900">Create Project</p>
              <p className="text-sm text-gray-600">Long-term project assignment</p>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
            >
              <ClockIcon className="h-8 w-8 text-primary-600 mb-2" />
              <p className="font-medium text-gray-900">Quick Quiz</p>
              <p className="text-sm text-gray-600">Short assessment</p>
            </motion.button>
          </div>
        </div>
      </Card>

      {/* Assignments Table */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">All Assignments</h3>
            <div className="flex gap-2">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <DataTable
            data={mockAssignments}
            columns={columns}
            searchPlaceholder="Search assignments..."
          />
        </div>
      </Card>
    </div>
  )
}

export default Assignments