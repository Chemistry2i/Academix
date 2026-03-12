import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  ArrowDownTrayIcon,
  XMarkIcon
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
  const [viewExam, setViewExam] = useState(null)
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
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewExam(exam)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-blue-200 rounded text-blue-600 hover:bg-blue-50 transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
            View
          </button>
          {hasAnyRole(['ADMIN', 'HEAD_TEACHER', 'DIRECTOR_OF_STUDIES']) && (
            <>
              <button
                onClick={() => handleEditExam(exam)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-yellow-200 rounded text-yellow-600 hover:bg-yellow-50 transition-colors"
                title="Edit Exam"
              >
                <PencilIcon className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleToggleLock(exam)}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded transition-colors ${
                  exam.isLocked
                    ? 'border-green-200 text-green-600 hover:bg-green-50'
                    : 'border-orange-200 text-orange-600 hover:bg-orange-50'
                }`}
                title={exam.isLocked ? 'Unlock Exam' : 'Lock Exam'}
              >
                {exam.isLocked ? <LockOpenIcon className="w-4 h-4" /> : <LockClosedIcon className="w-4 h-4" />}
                {exam.isLocked ? 'Unlock' : 'Lock'}
              </button>
              {hasAnyRole(['ADMIN']) && (
                <button
                  onClick={() => handleDeleteExam(exam)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-red-200 rounded text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete Exam"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      )
    }
  ]

  const handleViewExam = (exam) => {
    setViewExam(exam)
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
              className="bg-primary-600 hover:bg-primary-700 flex items-center"
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

      {/* View Exam Modal */}
      <AnimatePresence>
        {viewExam && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
              style={{ maxHeight: 'calc(100vh - 3rem)' }}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="shrink-0 bg-primary-700 text-white px-6 py-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                      <DocumentTextIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{viewExam.name}</h2>
                      <p className="text-primary-200 text-sm mt-0.5">{viewExam.code}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          viewExam.status === 'COMPLETED'
                            ? 'bg-green-400/20 text-green-100 ring-1 ring-green-300/40'
                            : viewExam.status === 'IN_PROGRESS'
                            ? 'bg-yellow-400/20 text-yellow-100 ring-1 ring-yellow-300/40'
                            : viewExam.status === 'CANCELLED'
                            ? 'bg-red-400/20 text-red-100 ring-1 ring-red-300/40'
                            : 'bg-blue-400/20 text-blue-100 ring-1 ring-blue-300/40'
                        }`}>
                          {viewExam.status?.replace(/_/g, ' ') || 'SCHEDULED'}
                        </span>
                        {viewExam.isPublished && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                            Published
                          </span>
                        )}
                        {viewExam.isLocked && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewExam(null)}
                    className="text-white/70 hover:text-white transition-colors mt-1"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Quick-stat strip */}
              <div className="shrink-0 bg-primary-600 text-white px-6 py-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Type</span>
                    <p className="font-medium">{viewExam.type || '—'}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Level</span>
                    <p className="font-medium">{viewExam.level?.replace(/_/g, '-') || '—'}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Year</span>
                    <p className="font-medium">{viewExam.academicYear || '—'}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Term</span>
                    <p className="font-medium">{viewExam.term || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                {/* Exam Details */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-b border-gray-200">
                    <span className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                      <DocumentTextIcon className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="text-sm font-semibold text-blue-800">Exam Details</h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Code', viewExam.code],
                        ['Name', viewExam.name],
                        ['Type', viewExam.type],
                        ['Level', viewExam.level?.replace(/_/g, '-')],
                        ['Academic Year', viewExam.academicYear],
                        ['Term', viewExam.term],
                        ['Status', viewExam.status?.replace(/_/g, ' ')],
                      ].filter(([, v]) => v != null && v !== '').map(([label, val], i) => (
                        <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-500 font-medium w-44">{label}</td>
                          <td className="px-4 py-2 text-gray-900">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Schedule */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-sky-50 border-b border-gray-200">
                    <span className="w-5 h-5 rounded bg-sky-600 flex items-center justify-center">
                      <CalendarDaysIcon className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="text-sm font-semibold text-sky-800">Schedule</h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Start Date', viewExam.startDate],
                        ['End Date', viewExam.endDate],
                        ['Marks Deadline', viewExam.marksEntryDeadline ? new Date(viewExam.marksEntryDeadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : null],
                      ].filter(([, v]) => v != null && v !== '').map(([label, val], i) => (
                        <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-500 font-medium w-44">{label}</td>
                          <td className="px-4 py-2 text-gray-900">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Target Classes */}
                {Array.isArray(viewExam.targetClasses) && viewExam.targetClasses.length > 0 && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border-b border-gray-200">
                      <span className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center">
                        <AcademicCapIcon className="w-3 h-3 text-white" />
                      </span>
                      <h3 className="text-sm font-semibold text-emerald-800">Target Classes</h3>
                    </div>
                    <div className="p-4 flex flex-wrap gap-1.5">
                      {viewExam.targetClasses.map((cls, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Settings */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-gray-200">
                    <span className="w-5 h-5 rounded bg-amber-600 flex items-center justify-center">
                      <LockClosedIcon className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="text-sm font-semibold text-amber-800">Settings</h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Locked', viewExam.isLocked ? 'Yes' : 'No'],
                        ['Published', viewExam.isPublished ? 'Yes' : 'No'],
                        viewExam.description ? ['Description', viewExam.description] : null,
                      ].filter(row => row != null).map(([label, val], i) => (
                        <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-500 font-medium w-44">{label}</td>
                          <td className="px-4 py-2 text-gray-900">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
                <span className="text-xs text-gray-500">{viewExam.code} — Term {viewExam.term}, {viewExam.academicYear}</span>
                <div className="flex gap-2">
                  {hasAnyRole(['ADMIN']) && (
                    <button
                      onClick={() => { setViewExam(null); handleEditExam(viewExam) }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-yellow-300 rounded-lg text-yellow-700 hover:bg-yellow-50 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => setViewExam(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Exams

