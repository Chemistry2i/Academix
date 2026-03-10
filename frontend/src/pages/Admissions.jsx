import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  UserPlusIcon, 
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'

const Admissions = () => {
  const [filter, setFilter] = useState('pending')
  const [gradeFilter, setGradeFilter] = useState('all')

  const mockApplications = [
    {
      id: 1,
      applicantName: 'Emma Thompson',
      grade: 'Grade 9',
      dateApplied: '2026-03-08',
      status: 'Pending Review',
      parentName: 'Robert Thompson',
      parentEmail: 'robert.thompson@email.com',
      phone: '+1 234-567-8901',
      previousSchool: 'Central Middle School',
      documents: ['Birth Certificate', 'Transcript', 'Recommendation']
    },
    {
      id: 2,
      applicantName: 'James Wilson',
      grade: 'Grade 10',
      dateApplied: '2026-03-07',
      status: 'Approved',
      parentName: 'Karen Wilson',
      parentEmail: 'karen.wilson@email.com',
      phone: '+1 234-567-8902',
      previousSchool: 'Oak Valley High',
      documents: ['Birth Certificate', 'Transcript', 'Medical Records']
    },
    {
      id: 3,
      applicantName: 'Sofia Rodriguez',
      grade: 'Grade 11',
      dateApplied: '2026-03-06',
      status: 'Interview Scheduled',
      parentName: 'Miguel Rodriguez',
      parentEmail: 'miguel.rodriguez@email.com',
      phone: '+1 234-567-8903',
      previousSchool: 'Lincoln High School',
      documents: ['Birth Certificate', 'Transcript']
    },
    {
      id: 4,
      applicantName: 'Alex Chen',
      grade: 'Grade 12',
      dateApplied: '2026-03-05',
      status: 'Rejected',
      parentName: 'Li Chen',
      parentEmail: 'li.chen@email.com',
      phone: '+1 234-567-8904',
      previousSchool: 'Metro High School',
      documents: ['Birth Certificate', 'Transcript', 'Portfolio']
    }
  ]

  const stats = [
    { title: 'Total Applications', value: '127', change: '+18', trend: 'up' },
    { title: 'Pending Review', value: '43', change: '+12', trend: 'up' },
    { title: 'Approved', value: '68', change: '+8', trend: 'up' },
    { title: 'Acceptance Rate', value: '78%', change: '+2%', trend: 'up' }
  ]

  const admissionSteps = [
    'Application Submitted',
    'Document Verification',
    'Interview Scheduled',
    'Entrance Test',
    'Final Review',
    'Decision'
  ]

  const columns = [
    { 
      key: 'applicantName', 
      header: 'Applicant',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{row.grade}</p>
        </div>
      )
    },
    { 
      key: 'parentName', 
      header: 'Parent/Guardian',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{row.parentEmail}</p>
        </div>
      )
    },
    { key: 'previousSchool', header: 'Previous School' },
    { key: 'dateApplied', header: 'Application Date' },
    { 
      key: 'documents', 
      header: 'Documents',
      render: (value) => (
        <div className="flex items-center gap-1">
          <DocumentTextIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{value.length} files</span>
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Approved' ? 'bg-green-100 text-green-800' :
          value === 'Pending Review' ? 'bg-yellow-100 text-yellow-800' :
          value === 'Interview Scheduled' ? 'bg-blue-100 text-blue-800' :
          value === 'Rejected' ? 'bg-red-100 text-red-800' :
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
          <Button size="sm" variant="outline">Review</Button>
          <Button size="sm" variant="ghost">View</Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admissions</h1>
          <p className="text-gray-600">Manage student applications and enrollment process</p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          New Application
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
        {/* Admission Process */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admission Process</h3>
              <div className="space-y-3">
                {admissionSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      index < 3 ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`text-sm ${
                      index < 3 ? 'text-gray-900 font-medium' : 'text-gray-600'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <ClockIcon className="h-8 w-8 text-yellow-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Pending Review</p>
                  <p className="text-sm text-gray-600">43 applications</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <CheckCircleIcon className="h-8 w-8 text-green-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Approved</p>
                  <p className="text-sm text-gray-600">68 applications</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <UserPlusIcon className="h-8 w-8 text-primary-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Schedule Interview</p>
                  <p className="text-sm text-gray-600">Arrange meetings</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <DocumentTextIcon className="h-8 w-8 text-primary-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Bulk Import</p>
                  <p className="text-sm text-gray-600">Import applications</p>
                </motion.button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">All Applications</h3>
            <div className="flex gap-2">
              <select 
                value={gradeFilter} 
                onChange={(e) => setGradeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Grades</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="interview">Interview Scheduled</option>
                <option value="rejected">Rejected</option>
                <option value="all">All Status</option>
              </select>
            </div>
          </div>
          <DataTable
            data={mockApplications}
            columns={columns}
            searchPlaceholder="Search applications..."
          />
        </div>
      </Card>
    </div>
  )
}

export default Admissions