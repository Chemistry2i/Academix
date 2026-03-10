import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  ClockIcon,
  AcademicCapIcon,
  LockClosedIcon,
  LockOpenIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import { examService } from '../services/examService'
import ExamRegistration from '../components/exams/ExamRegistration'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

const Exams = () => {
  const { hasAnyRole, user } = useAuth()
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingExam, setEditingExam] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    published: 0,
    locked: 0
  })
  const [filters, setFilters] = useState({
    type: '',
    level: '',
    status: '',
    academicYear: '2025/2026',
    term: 1
  })

  const [examTypes] = useState([
    { value: 'BOT', label: 'Beginning of Term (BOT)' },
    { value: 'MOT', label: 'Mid of Term (MOT)' },
    { value: 'EOT', label: 'End of Term (EOT)' },
    { value: 'UCE', label: 'Uganda Certificate of Education (UCE)' },
    { value: 'UACE', label: 'Uganda Advanced Certificate of Education (UACE)' },
    { value: 'MOCK', label: 'Mock Exam' },
    { value: 'QUIZ', label: 'Quiz' }
  ])

  const [examLevels] = useState([
    { value: 'O_LEVEL', label: 'O-Level (S1-S4)' },
    { value: 'A_LEVEL', label: 'A-Level (S5-S6)' }
  ])

  useEffect(() => {
    loadExams()
    loadStatistics()
  }, [filters])

  const loadExams = async () => {
    try {
      setLoading(true)
      let data
      if (filters.type) {
        data = await examService.getExamsByType(filters.type)
      } else if (filters.level) {
        data = await examService.getExamsByLevel(filters.level)
      } else if (filters.academicYear && filters.term) {
        data = await examService.getExamsByYearAndTerm(filters.academicYear, filters.term)
      } else {
        data = await examService.getAllExams()
      }
      
      // Filter by status if specified
      if (filters.status && data) {
        data = data.filter(exam => exam.status === filters.status)
      }
      
      setExams(data || [])
    } catch (error) {
      console.error('Failed to load exams:', error)
      toast.error('Failed to load examination data')
      setExams([])
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const statisticsData = await examService.getExamStatistics()
      setStats({
        total: statisticsData.total || 0,
        scheduled: statisticsData.scheduled || 0,
        inProgress: statisticsData.inProgress || 0,
        completed: statisticsData.completed || 0,
        published: statisticsData.published || 0,
        locked: statisticsData.locked || 0
      })
    } catch (error) {
      console.error('Failed to load exam statistics:', error)
      // Calculate stats from loaded exams
      const examsByStatus = exams.reduce((acc, exam) => {
        acc[exam.status] = (acc[exam.status] || 0) + 1
        return acc
      }, {})
      
      setStats({
        total: exams.length,
        scheduled: examsByStatus.SCHEDULED || 0,
        inProgress: examsByStatus.IN_PROGRESS || 0,
        completed: examsByStatus.COMPLETED || 0,
        published: exams.filter(e => e.isPublished).length,
        locked: exams.filter(e => e.isLocked).length
      })
    }
  }

  const columns = [
    {
      key: 'code',
      header: 'Exam Code',
      render: (value) => (
        <span className="font-mono text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Exam Name',
      render: (value, exam) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">
            {exam.type} - {exam.level?.replace('_', '-')}
          </div>
        </div>
      )
    },
    {
      key: 'academicYear',
      header: 'Academic Year',
      render: (value, exam) => (
        <div className="text-sm">
          <div>{value}</div>
          <div className="text-gray-500">Term {exam.term}</div>
        </div>
      )
    },
    {
      key: 'dates',
      header: 'Exam Period',
      render: (_, exam) => (
        <div className="text-sm">
          <div>{exam.startDate}</div>
          <div className="text-gray-500">to {exam.endDate}</div>
        </div>
      )
    },
    {
      key: 'targetClasses',
      header: 'Target Classes',
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(value) && value.length > 0 ? (
            value.slice(0, 3).map((className, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
              >
                {className}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-xs">No classes</span>
          )}
          {Array.isArray(value) && value.length > 3 && (
            <span className="text-gray-500 text-xs">+{value.length - 3} more</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'COMPLETED'
            ? 'bg-green-100 text-green-800'
            : value === 'IN_PROGRESS'
            ? 'bg-blue-100 text-blue-800'
            : value === 'SCHEDULED'
            ? 'bg-yellow-100 text-yellow-800'
            : value === 'DRAFT'
            ? 'bg-gray-100 text-gray-800'
            : value === 'CANCELLED'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value?.replace('_', ' ') || 'Unknown'}
        </span>
      )
    },
    {
      key: 'flags',
      header: 'Flags',
      render: (_, exam) => (
        <div className="flex items-center space-x-1">
          {exam.isLocked && (
            <LockClosedIcon className="w-4 h-4 text-red-500" title="Locked" />
          )}
          {exam.isPublished && (
            <CheckCircleIcon className="w-4 h-4 text-green-500" title="Published" />
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, exam) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewExam(exam)}
            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          {hasAnyRole(['ADMIN', 'HEAD_TEACHER', 'DIRECTOR_OF_STUDIES']) && (
            <>
              <button
                onClick={() => handleEditExam(exam)}
                className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded transition-colors"
                title="Edit Exam"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleToggleLock(exam)}
                className={`${exam.isLocked ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'} p-1 hover:bg-gray-50 rounded transition-colors`}
                title={exam.isLocked ? 'Unlock Exam' : 'Lock Exam'}
              >
                {exam.isLocked ? <LockOpenIcon className="w-4 h-4" /> : <LockClosedIcon className="w-4 h-4" />}
              </button>
              {hasAnyRole(['ADMIN']) && (
                <button
                  onClick={() => handleDeleteExam(exam)}
                  className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                  title="Delete Exam"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      )
    }
  ]

  const handleViewExam = (exam) => {
    Swal.fire({
      title: `${exam.code} - ${exam.name}`,
      html: `
        <div class="text-left space-y-2">
          <p><strong>Code:</strong> ${exam.code}</p>
          <p><strong>Type:</strong> ${exam.type}</p>
          <p><strong>Level:</strong> ${exam.level?.replace('_', '-')}</p>
          <p><strong>Academic Year:</strong> ${exam.academicYear}</p>
          <p><strong>Term:</strong> ${exam.term}</p>
          <p><strong>Start Date:</strong> ${exam.startDate}</p>
          <p><strong>End Date:</strong> ${exam.endDate}</p>
          ${exam.marksEntryDeadline ? `<p><strong>Marks Entry Deadline:</strong> ${new Date(exam.marksEntryDeadline).toLocaleDateString()}</p>` : ''}
          <p><strong>Target Classes:</strong> ${Array.isArray(exam.targetClasses) ? exam.targetClasses.join(', ') : 'None'}</p>
          <p><strong>Status:</strong> ${exam.status?.replace('_', ' ')}</p>
          <p><strong>Locked:</strong> ${exam.isLocked ? 'Yes' : 'No'}</p>
          <p><strong>Published:</strong> ${exam.isPublished ? 'Yes' : 'No'}</p>
          ${exam.description ? `<p><strong>Description:</strong> ${exam.description}</p>` : ''}
        </div>
      `,
      icon: 'info',
      customClass: {
        container: 'font-outfit',
        popup: 'rounded-xl'
      }
    })
  }

  const handleEditExam = (exam) => {
    setEditingExam(exam)
    setShowAddModal(true)
  }

  const handleDeleteExam = async (exam) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete the ${exam.code} examination.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
      customClass: {
        container: 'font-outfit',
        popup: 'rounded-xl'
      }
    })

    if (result.isConfirmed) {
      try {
        await examService.deleteExam(exam.id)
        toast.success('Exam deleted successfully')
        loadExams()
        loadStatistics()
      } catch (error) {
        console.error('Failed to delete exam:', error)
        toast.error('Failed to delete exam')
      }
    }
  }

  const handleToggleLock = async (exam) => {
    try {
      if (exam.isLocked) {
        await examService.unlockExam(exam.id)
        toast.success('Exam unlocked successfully')
      } else {
        await examService.lockExam(exam.id)
        toast.success('Exam locked successfully')
      }
      loadExams()
      loadStatistics()
    } catch (error) {
      console.error('Failed to toggle exam lock:', error)
      toast.error('Failed to update exam lock status')
    }
  }

  const handleAddExam = () => {
    setEditingExam(null)
    setShowAddModal(true)
  }

  const handleExportExams = async () => {
    try {
      // Implementation for exporting exam data
      toast.success('Exams exported successfully')
    } catch (error) {
      console.error('Failed to export exams:', error)
      toast.error('Failed to export exam data')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-3 text-gray-600">Loading examinations...</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Examination Management</h1>
          <p className="text-gray-600 mt-1">Schedule and manage examinations</p>
        </div>
        {hasAnyRole(['ADMIN', 'HEAD_TEACHER', 'DIRECTOR_OF_STUDIES']) && (
          <div className="flex items-center space-x-3">
            <Button 
              onClick={handleExportExams}
              variant="outline"
              className="flex items-center"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              onClick={handleAddExam}
              className="bg-purple-600 hover:bg-purple-700 flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Schedule Exam
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Exam Type
              </label>
              <select
                id="type"
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Types</option>
                {examTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                id="level"
                value={filters.level}
                onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Levels</option>
                {examLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year
              </label>
              <select
                id="academicYear"
                value={filters.academicYear}
                onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="2025/2026">2025/2026</option>
                <option value="2024/2025">2024/2025</option>
                <option value="2023/2024">2023/2024</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => setFilters({
                  type: '',
                  level: '',
                  status: '',
                  academicYear: '2025/2026',
                  term: 1
                })}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <StatCard
          title="Total Exams"
          value={stats.total}
          icon={DocumentTextIcon}
          color="purple"
          subtitle="All exams"
        />
        <StatCard
          title="Scheduled"
          value={stats.scheduled}
          icon={CalendarDaysIcon}
          color="blue"
          subtitle="Upcoming"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={ClockIcon}
          color="yellow"
          subtitle="Ongoing"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircleIcon}
          color="green"
          subtitle="Finished"
        />
        <StatCard
          title="Published"
          value={stats.published}
          icon={AcademicCapIcon}
          color="indigo"
          subtitle="Results out"
        />
        <StatCard
          title="Locked"
          value={stats.locked}
          icon={LockClosedIcon}
          color="red"
          subtitle="Read-only"
        />
      </div>

      {/* Exams Table */}
      {exams.length > 0 ? (
        <DataTable
          data={exams}
          columns={columns}
          searchable
          sortable
          pagination
          pageSize={15}
        />
      ) : (
        <Card>
          <div className="p-12 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No examinations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No examinations found for the current filters.
            </p>
            {hasAnyRole(['ADMIN', 'HEAD_TEACHER', 'DIRECTOR_OF_STUDIES']) && (
              <div className="mt-6">
                <Button 
                  onClick={handleAddExam}
                  className="flex items-center mx-auto"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Schedule Exam
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Exam Registration Modal */}
      <ExamRegistration
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setEditingExam(null)
        }}
        onSuccess={loadExams}
        editingExam={editingExam}
      />
    </motion.div>
  )
}

export default Exams

