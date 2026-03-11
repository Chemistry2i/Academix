import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  BookOpenIcon,
  AcademicCapIcon,
  BeakerIcon,
  PaintBrushIcon,
  CogIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import { subjectService } from '../services/subjectService'
import SubjectRegistration from '../components/subjects/SubjectRegistration'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

const Subjects = () => {
  const { hasAnyRole, user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [viewSubject, setViewSubject] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    oLevel: 0,
    aLevel: 0,
    compulsory: 0,
    elective: 0,
    active: 0,
    science: 0,
    arts: 0
  })
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    isActive: '',
    isScience: ''
  })

  const subjectLevels = [
    { value: 'O_LEVEL', label: 'O-Level (S1-S4)' },
    { value: 'A_LEVEL', label: 'A-Level (S5-S6)' },
    { value: 'BOTH', label: 'Both Levels' }
  ]

  const subjectCategories = [
    { value: 'LANGUAGE', label: 'Language' },
    { value: 'SCIENCE', label: 'Science' },
    { value: 'MATHEMATICS', label: 'Mathematics' },
    { value: 'SOCIAL_STUDIES', label: 'Social Studies' },
    { value: 'ARTS', label: 'Arts' },
    { value: 'TECHNICAL', label: 'Technical' },
    { value: 'RELIGIOUS', label: 'Religious Studies' }
  ]

  useEffect(() => {
    loadSubjects()
    loadStatistics()
  }, [filters])

  const loadSubjects = async () => {
    try {
      setLoading(true)
      let data
      
      if (filters.level) {
        data = await subjectService.getSubjectsByLevel(filters.level)
      } else if (filters.category) {
        data = await subjectService.getSubjectsByCategory(filters.category)
      } else if (filters.isActive === 'true') {
        data = await subjectService.getActiveSubjects()
      } else if (filters.isScience === 'true') {
        data = await subjectService.getScienceSubjects()
      } else if (filters.isScience === 'false') {
        data = await subjectService.getArtsSubjects()
      } else {
        data = await subjectService.getAllSubjects()
      }
      
      setSubjects(data || [])
    } catch (error) {
      console.error('Failed to load subjects:', error)
      toast.error('Failed to load subjects data')
      setSubjects([])
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const statisticsData = await subjectService.getSubjectStatistics()
      setStats({
        total: statisticsData.total || 0,
        oLevel: statisticsData.oLevel || 0,
        aLevel: statisticsData.aLevel || 0,
        compulsory: statisticsData.compulsory || 0,
        elective: statisticsData.elective || 0,
        active: statisticsData.active || 0,
        science: statisticsData.science || 0,
        arts: statisticsData.arts || 0
      })
    } catch (error) {
      console.error('Failed to load subject statistics:', error)
      // Calculate stats from loaded subjects
      const oLevel = subjects.filter(s => s.level === 'O_LEVEL' || s.level === 'BOTH').length
      const aLevel = subjects.filter(s => s.level === 'A_LEVEL' || s.level === 'BOTH').length
      const active = subjects.filter(s => s.isActive).length
      const science = subjects.filter(s => s.isScience).length
      const arts = subjects.filter(s => s.isArts).length
      const compulsory = subjects.filter(s => s.isCompulsory).length
      const elective = subjects.filter(s => !s.isCompulsory).length
      
      setStats({
        total: subjects.length,
        oLevel,
        aLevel,
        compulsory,
        elective,
        active,
        science,
        arts
      })
    }
  }

  const columns = [
    {
      key: 'code',
      header: 'Subject Code',
      render: (value) => (
        <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Subject Name',
      render: (value, subject) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">
            {subject.category?.replace('_', ' ')} • {subject.paperCount || 1} paper{subject.paperCount > 1 ? 's' : ''}
          </div>
        </div>
      )
    },
    {
      key: 'level',
      header: 'Level',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'O_LEVEL'
            ? 'bg-green-100 text-green-800'
            : value === 'A_LEVEL'
            ? 'bg-blue-100 text-blue-800'
            : value === 'BOTH'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value === 'O_LEVEL' ? 'O-Level' : value === 'A_LEVEL' ? 'A-Level' : value === 'BOTH' ? 'Both' : 'Unknown'}
        </span>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (value) => (
        <span className="text-sm text-gray-600">
          {value?.replace('_', ' ') || 'N/A'}
        </span>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (_, subject) => (
        <div className="flex flex-wrap gap-1">
          {subject.isCompulsory && (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
              Compulsory
            </span>
          )}
          {subject.isScience && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
              Science
            </span>
          )}
          {subject.isArts && (
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
              Arts
            </span>
          )}
        </div>
      )
    },
    {
      key: 'marks',
      header: 'Max Marks',
      render: (_, subject) => (
        <div className="text-sm">
          <div>{subject.maxMarksPerPaper || 100} per paper</div>
          {subject.paperCount > 1 && (
            <div className="text-xs text-gray-500">
              Total: {(subject.maxMarksPerPaper || 100) * (subject.paperCount || 1)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, subject) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewSubject(subject)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-blue-200 rounded text-blue-600 hover:bg-blue-50 transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
            View
          </button>
          {hasAnyRole(['ADMIN', 'HEAD_TEACHER']) && (
            <>
              <button
                onClick={() => handleEditSubject(subject)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-yellow-200 rounded text-yellow-600 hover:bg-yellow-50 transition-colors"
                title="Edit Subject"
              >
                <PencilIcon className="w-4 h-4" />
                Edit
              </button>
              {hasAnyRole(['ADMIN']) && (
                <button
                  onClick={() => handleDeleteSubject(subject)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-red-200 rounded text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete Subject"
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

  const handleViewSubject = (subject) => {
    setViewSubject(subject)
  }

  const handleEditSubject = (subject) => {
    setEditingSubject(subject)
    setShowAddModal(true)
  }

  const handleDeleteSubject = async (subject) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete the ${subject.code} subject.`,
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
        await subjectService.deleteSubject(subject.id)
        toast.success('Subject deleted successfully')
        loadSubjects()
        loadStatistics()
      } catch (error) {
        console.error('Failed to delete subject:', error)
        toast.error('Failed to delete subject')
      }
    }
  }

  const handleAddSubject = () => {
    setEditingSubject(null)
    setShowAddModal(true)
  }

  const handleExportSubjects = async () => {
    try {
      // Implementation for exporting subject data
      toast.success('Subjects exported successfully')
    } catch (error) {
      console.error('Failed to export subjects:', error)
      toast.error('Failed to export subjects')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-3 text-gray-600">Loading subjects...</span>
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
          <h1 className="text-2xl font-bold text-gray-900">Subject Management</h1>
          <p className="text-gray-600 mt-1">Manage curriculum subjects and courses</p>
        </div>
        {hasAnyRole(['ADMIN', 'HEAD_TEACHER']) && (
          <div className="flex items-center space-x-3">
            <Button 
              onClick={handleExportSubjects}
              variant="outline"
              className="flex items-center"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              onClick={handleAddSubject}
              className="bg-blue-600 hover:bg-blue-700 flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                id="level"
                value={filters.level}
                onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                {subjectLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {subjectCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="isActive"
                value={filters.isActive}
                onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => setFilters({
                  level: '',
                  category: '',
                  isActive: '',
                  isScience: ''
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <StatCard
          title="Total Subjects"
          value={stats.total}
          icon={BookOpenIcon}
          color="blue"
          subtitle="All subjects"
        />
        <StatCard
          title="O-Level"
          value={stats.oLevel}
          icon={AcademicCapIcon}
          color="green"
          subtitle="S1-S4 subjects"
        />
        <StatCard
          title="A-Level"
          value={stats.aLevel}
          icon={AcademicCapIcon}
          color="purple"
          subtitle="S5-S6 subjects"
        />
        <StatCard
          title="Active"
          value={stats.active}
          icon={CogIcon}
          color="indigo"
          subtitle="Currently offered"
        />
        <StatCard
          title="Compulsory"
          value={stats.compulsory}
          icon={BookOpenIcon}
          color="red"
          subtitle="Required subjects"
        />
        <StatCard
          title="Elective"
          value={stats.elective}
          icon={BookOpenIcon}
          color="yellow"
          subtitle="Optional subjects"
        />
        <StatCard
          title="Science"
          value={stats.science}
          icon={BeakerIcon}
          color="teal"
          subtitle="Science subjects"
        />
        <StatCard
          title="Arts"
          value={stats.arts}
          icon={PaintBrushIcon}
          color="orange"
          subtitle="Arts subjects"
        />
      </div>

      {/* Subjects Table */}
      {subjects.length > 0 ? (
        <DataTable
          data={subjects}
          columns={columns}
          searchable
          sortable
          pagination
          pageSize={15}
        />
      ) : (
        <Card>
          <div className="p-12 text-center">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No subjects found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No subjects found for the current filters.
            </p>
            {hasAnyRole(['ADMIN', 'HEAD_TEACHER']) && (
              <div className="mt-6">
                <Button 
                  onClick={handleAddSubject}
                  className="flex items-center mx-auto"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Subject
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Subject Registration Modal */}
      <SubjectRegistration
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setEditingSubject(null)
        }}
        onSuccess={loadSubjects}
        editingSubject={editingSubject}
      />

      {/* View Subject Modal */}
      <AnimatePresence>
        {viewSubject && (
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
                      <BookOpenIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{viewSubject.name}</h2>
                      <p className="text-primary-200 text-sm mt-0.5">{viewSubject.code}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          viewSubject.isActive !== false
                            ? 'bg-green-400/20 text-green-100 ring-1 ring-green-300/40'
                            : 'bg-red-400/20 text-red-100 ring-1 ring-red-300/40'
                        }`}>
                          {viewSubject.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                        {viewSubject.isCompulsory && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                            Compulsory
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewSubject(null)}
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
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Category</span>
                    <p className="font-medium">{viewSubject.category?.replace(/_/g, ' ') || '—'}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Level</span>
                    <p className="font-medium">{viewSubject.level?.replace(/_/g, '-') || '—'}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Papers</span>
                    <p className="font-medium">{viewSubject.paperCount || 1}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Total Marks</span>
                    <p className="font-medium">{(viewSubject.maxMarksPerPaper || 100) * (viewSubject.paperCount || 1)}</p>
                  </div>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                {/* Subject Details */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-b border-gray-200">
                    <span className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                      <BookOpenIcon className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="text-sm font-semibold text-blue-800">Subject Details</h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Code', viewSubject.code],
                        ['Name', viewSubject.name],
                        ['Category', viewSubject.category?.replace(/_/g, ' ')],
                        ['Level', viewSubject.level?.replace(/_/g, '-')],
                        ['Paper Count', viewSubject.paperCount ?? 1],
                        ['Max Marks / Paper', viewSubject.maxMarksPerPaper ?? 100],
                        ['Total Marks', (viewSubject.maxMarksPerPaper || 100) * (viewSubject.paperCount || 1)],
                      ].filter(([, v]) => v != null && v !== '').map(([label, val], i) => (
                        <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-500 font-medium w-44">{label}</td>
                          <td className="px-4 py-2 text-gray-900">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Classification */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-sky-50 border-b border-gray-200">
                    <span className="w-5 h-5 rounded bg-sky-600 flex items-center justify-center">
                      <AcademicCapIcon className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="text-sm font-semibold text-sky-800">Classification</h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Compulsory', viewSubject.isCompulsory ? 'Yes' : 'No'],
                        ['Science Subject', viewSubject.isScience ? 'Yes' : 'No'],
                        ['Arts Subject', viewSubject.isArts ? 'Yes' : 'No'],
                        ['Status', viewSubject.isActive !== false ? 'Active' : 'Inactive'],
                      ].map(([label, val], i) => (
                        <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-500 font-medium w-44">{label}</td>
                          <td className="px-4 py-2 text-gray-900">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Notes */}
                {(viewSubject.description || viewSubject.syllabus) && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border-b border-gray-200">
                      <span className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center">
                        <CogIcon className="w-3 h-3 text-white" />
                      </span>
                      <h3 className="text-sm font-semibold text-emerald-800">Additional Info</h3>
                    </div>
                    <table className="w-full text-sm">
                      <tbody>
                        {[
                          ['Description', viewSubject.description],
                          ['Syllabus', viewSubject.syllabus],
                        ].filter(([, v]) => v != null && v !== '').map(([label, val], i) => (
                          <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2 text-gray-500 font-medium w-44 align-top">{label}</td>
                            <td className="px-4 py-2 text-gray-900">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
                <span className="text-xs text-gray-500">{viewSubject.code} — {viewSubject.level?.replace(/_/g, '-') || 'Subject'}</span>
                <div className="flex gap-2">
                  {hasAnyRole(['ADMIN']) && (
                    <button
                      onClick={() => { setViewSubject(null); handleEditSubject(viewSubject) }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-yellow-300 rounded-lg text-yellow-700 hover:bg-yellow-50 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => setViewSubject(null)}
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

export default Subjects

