import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { DocumentTextIcon, PlusIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'

const Exams = () => {
  const [exams] = useState([
    {
      id: 1,
      examName: 'Mid-Term Examination',
      subject: 'Mathematics',
      class: 'S.6 Science',
      date: '2026-03-15',
      duration: '3 hours',
      status: 'Scheduled'
    },
    {
      id: 2,
      examName: 'Final Examination',
      subject: 'Physics',
      class: 'S.5 Science',
      date: '2026-03-20',
      duration: '2.5 hours',
      status: 'Scheduled'
    },
    {
      id: 3,
      examName: 'Quiz Test',
      subject: 'Chemistry',
      class: 'S.4',
      date: '2026-03-10',
      duration: '1 hour',
      status: 'Completed'
    }
  ])

  const columns = [
    { key: 'examName', label: 'Exam Name' },
    { key: 'subject', label: 'Subject' },
    { key: 'class', label: 'Class' },
    { key: 'date', label: 'Date' },
    { key: 'duration', label: 'Duration' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'Completed' ? 'bg-green-100 text-green-800' :
          value === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Examination Management</h1>
          <p className="text-gray-600 mt-1">Schedule and manage examinations</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <PlusIcon className="w-4 h-4 mr-2" />
          Schedule Exam
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <DocumentTextIcon className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Examinations</h3>
          </div>
          <DataTable
            data={exams}
            columns={columns}
            searchable={true}
            pagination={true}
          />
        </div>
      </Card>
    </motion.div>
  )
}

export default Exams