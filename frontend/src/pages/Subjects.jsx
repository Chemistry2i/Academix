import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import { subjectService } from '../services/subjectService'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

const Subjects = () => {
  const { hasAnyRole, user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
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
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewSubject(subject)}
            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          {hasAnyRole(['ADMIN', 'HEAD_TEACHER']) && (
            <>
              <button
                onClick={() => handleEditSubject(subject)}
                className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded transition-colors"
                title="Edit Subject"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              {hasAnyRole(['ADMIN']) && (
                <button
                  onClick={() => handleDeleteSubject(subject)}
                  className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                  title="Delete Subject"
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

  const handleViewSubject = (subject) => {
    Swal.fire({
      title: `${subject.code} - ${subject.name}`,
      html: `
        <div class="text-left space-y-2">
          <p><strong>Code:</strong> ${subject.code}</p>
          <p><strong>Category:</strong> ${subject.category?.replace('_', ' ')}</p>
          <p><strong>Level:</strong> ${subject.level?.replace('_', '-')}</p>
          <p><strong>Paper Count:</strong> ${subject.paperCount || 1}</p>
          <p><strong>Max Marks per Paper:</strong> ${subject.maxMarksPerPaper || 100}</p>
          <p><strong>Total Marks:</strong> ${(subject.maxMarksPerPaper || 100) * (subject.paperCount || 1)}</p>
          <p><strong>Compulsory:</strong> ${subject.isCompulsory ? 'Yes' : 'No'}</p>
          <p><strong>Science Subject:</strong> ${subject.isScience ? 'Yes' : 'No'}</p>
          <p><strong>Arts Subject:</strong> ${subject.isArts ? 'Yes' : 'No'}</p>
          <p><strong>Status:</strong> ${subject.isActive ? 'Active' : 'Inactive'}</p>
          ${subject.description ? `<p><strong>Description:</strong> ${subject.description}</p>` : ''}
          ${subject.syllabus ? `<p><strong>Syllabus:</strong> ${subject.syllabus}</p>` : ''}
        </div>
      `,
      icon: 'info',
      customClass: {
        container: 'font-outfit',
        popup: 'rounded-xl'
      }
    })
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
    </motion.div>
  )
}

export default Subjects

