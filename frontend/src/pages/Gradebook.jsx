import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  StarIcon, 
  PlusIcon,
  ChartBarIcon,
  AcademicCapIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'

const Gradebook = () => {
  const [selectedClass, setSelectedClass] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')

  const mockGrades = [
    {
      id: 1,
      studentName: 'Alice Johnson',
      studentId: 'STU001',
      class: 'Grade 10A',
      subject: 'Mathematics',
      assignment: 'Mid-term Exam',
      score: '85',
      maxScore: '100',
      grade: 'B+',
      date: '2026-03-10'
    },
    {
      id: 2,
      studentName: 'Bob Smith',
      studentId: 'STU002',
      class: 'Grade 10A',
      subject: 'Mathematics',
      assignment: 'Mid-term Exam',
      score: '92',
      maxScore: '100',
      grade: 'A',
      date: '2026-03-10'
    },
    {
      id: 3,
      studentName: 'Carol Brown',
      studentId: 'STU003',
      class: 'Grade 10A', 
      subject: 'English',
      assignment: 'Essay Assignment',
      score: '78',
      maxScore: '100',
      grade: 'B',
      date: '2026-03-08'
    }
  ]

  const stats = [
    { title: 'Total Grades', value: '1,247', change: '+89', trend: 'up' },
    { title: 'Class Average', value: '82.5%', change: '+1.2%', trend: 'up' },
    { title: 'Failing Students', value: '8', change: '-3', trend: 'down' },
    { title: 'Perfect Scores', value: '23', change: '+5', trend: 'up' }
  ]

  const columns = [
    { 
      key: 'studentName', 
      header: 'Student',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{row.studentId}</p>
        </div>
      )
    },
    { key: 'class', header: 'Class' },
    { key: 'subject', header: 'Subject' },
    { key: 'assignment', header: 'Assignment' },
    { 
      key: 'score', 
      header: 'Score',
      render: (value, row) => (
        <span className="font-medium">{value}/{row.maxScore}</span>
      )
    },
    { 
      key: 'grade', 
      header: 'Grade',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'A' ? 'bg-green-100 text-green-800' :
          value === 'B+' || value === 'B' ? 'bg-blue-100 text-blue-800' :
          value === 'C+' || value === 'C' ? 'bg-yellow-100 text-yellow-800' :
          value === 'D' ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'date', header: 'Date' },
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
          <h1 className="text-3xl font-bold text-gray-900">Gradebook</h1>
          <p className="text-gray-600">Manage student grades and assessments</p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Add Grade
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

      {/* Grades Table */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Grades</h3>
            <div className="flex gap-2">
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Classes</option>
                <option value="10A">Grade 10A</option>
                <option value="10B">Grade 10B</option>
                <option value="11A">Grade 11A</option>
              </select>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Subjects</option>
                <option value="mathematics">Mathematics</option>
                <option value="english">English</option>
                <option value="science">Science</option>
              </select>
            </div>
          </div>
          <DataTable
            data={mockGrades}
            columns={columns}
            searchPlaceholder="Search grades..."
          />
        </div>
      </Card>
    </div>
  )
}

export default Gradebook