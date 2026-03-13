import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  BookOpenIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
  BeakerIcon,
  PaintBrushIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Button from '../../components/common/Button'
import StatCard from '../../components/common/StatCard'
import DataTable from '../../components/common/DataTable'
import CourseRegistration from '../../components/courses/CourseRegistration'
import { useAuth } from '../../contexts/AuthContext'
import { courseService } from '../../services/courseService'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

const Courses = () => {
  const { hasAnyRole } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [viewCourse, setViewCourse] = useState(null)

  // Load courses from backend
  useEffect(() => {
    loadCourses()
  }, [])

  const stats = useMemo(() => {
    const total = courses.length
    const active = courses.filter((course) => course.isActive !== false).length
    const sciences = courses.filter((course) => course.type === 'SCIENCES').length
    const arts = courses.filter((course) => course.type === 'ARTS').length
    const technical = courses.filter((course) => course.type === 'TECHNICAL').length
    const mixed = courses.filter((course) => course.type === 'MIXED').length
    const aLevel = courses.filter((course) => course.level === 'A_LEVEL').length
    const oLevel = courses.filter((course) => course.level === 'O_LEVEL').length
    const totalEnrollment = courses.reduce((sum, course) => sum + Number(course.currentEnrollment || 0), 0)
    const totalCapacity = courses.reduce((sum, course) => sum + Number(course.maxStudents || 0), 0)
    const averageEnrollment = active > 0 ? Math.round(totalEnrollment / active) : 0

    return {
      total,
      active,
      sciences,
      arts,
      technical,
      mixed,
      aLevel,
      oLevel,
      totalEnrollment,
      totalCapacity,
      averageEnrollment
    }
  }, [courses])

  const getTypePreview = (type) => {
    const preview = courses
      .filter((course) => course.type === type)
      .slice(0, 3)
      .map((course) => course.code || course.name)
      .filter(Boolean)
      .join(', ')

    return preview || 'No courses yet'
  }

  const loadCourses = async () => {
    try {
      setLoading(true)
      const data = await courseService.getCourses()
      setCourses(data || [])
    } catch (error) {
      console.error('Failed to load courses:', error)
      toast.error('Failed to load courses from server')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'code',
      header: 'Course Code',
      render: (value) => (
        <span className="font-mono text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Course Name',
      render: (value, course) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">
            {course.type} - {course.level}
          </div>
        </div>
      )
    },
    {
      key: 'principalSubjects',
      header: 'Principal Subjects',
      render: (value) => (
        <div className="text-sm">
          {Array.isArray(value) && value.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {value.map((subject, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                >
                  {subject}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-500">No subjects</span>
          )}
        </div>
      )
    },
    {
      key: 'enrollment',
      header: 'Enrollment',
      render: (_, course) => (
        <div className="text-sm">
          <div className="font-medium">
            {course.currentEnrollment || 0}
            {course.maxStudents > 0 && ` / ${course.maxStudents}`}
          </div>
          {course.maxStudents > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${Math.min((course.currentEnrollment / course.maxStudents) * 100, 100)}%`
                }}
              />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'SCIENCES'
            ? 'bg-green-100 text-green-800'
            : value === 'ARTS'
            ? 'bg-orange-100 text-orange-800'
            : value === 'TECHNICAL'
            ? 'bg-blue-100 text-blue-800'
            : value === 'MIXED'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, course) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          course.isActive !== false
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {course.isActive !== false ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, course) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewCourse(course)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-blue-200 rounded text-blue-600 hover:bg-blue-50 transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
            View
          </button>
          {hasAnyRole(['ADMIN', 'HEAD_TEACHER']) && (
            <>
              <button
                onClick={() => handleEditCourse(course)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-yellow-200 rounded text-yellow-600 hover:bg-yellow-50 transition-colors"
                title="Edit Course"
              >
                <PencilIcon className="w-4 h-4" />
                Edit
              </button>
              {hasAnyRole(['ADMIN']) && (
                <button
                  onClick={() => handleDeleteCourse(course)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-red-200 rounded text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete Course"
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

  const handleViewCourse = (course) => {
    setViewCourse(course)
  }

  const handleEditCourse = (course) => {
    setEditingCourse(course)
    setShowAddModal(true)
  }

  const handleDeleteCourse = async (course) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete the ${course.code} course combination.`,
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
        await courseService.deleteCourse(course.id)
        toast.success('Course deleted successfully')
        loadCourses() // Refresh the list
      } catch (error) {
        console.error('Failed to delete course:', error)
        toast.error('Failed to delete course')
      }
    }
  }

  const handleAddCourse = () => {
    setEditingCourse(null)
    setShowAddModal(true)
  }

  const handleModalClose = () => {
    setShowAddModal(false)
    setEditingCourse(null)
  }

  const handleCourseSuccess = () => {
    loadCourses() // Refresh the courses list
    setShowAddModal(false)
    setEditingCourse(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className="ml-3 text-gray-600">Loading courses...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-1">Manage A-Level subject combinations</p>
        </div>
        {hasAnyRole(['ADMIN', 'HEAD_TEACHER']) && (
          <Button onClick={handleAddCourse} className="flex items-center">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Course
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Courses"
          value={stats.total}
          icon={BookOpenIcon}
          color="purple"
          subtitle={`${stats.aLevel} A-Level, ${stats.oLevel} O-Level`}
        />
        <StatCard
          title="Active Courses"
          value={stats.active}
          icon={AcademicCapIcon}
          color="green"
          subtitle={`${Math.round((stats.active / Math.max(stats.total, 1)) * 100)}% of total`}
        />
        <StatCard
          title="Sciences"
          value={stats.sciences}
          icon={BeakerIcon}
          color="blue"
          subtitle={getTypePreview('SCIENCES')}
        />
        <StatCard
          title="Arts"
          value={stats.arts}
          icon={PaintBrushIcon}
          color="orange"
          subtitle={getTypePreview('ARTS')}
        />
        <StatCard
          title="Total Enrolled"
          value={stats.totalEnrollment}
          icon={UserGroupIcon}
          color="indigo"
          subtitle={`Avg: ${stats.averageEnrollment} per course`}
        />
        <StatCard
          title="Capacity"
          value={stats.totalCapacity || 'Unlimited'}
          icon={BookOpenIcon}
          color="yellow"
          subtitle={stats.totalCapacity > 0 ? `${Math.round((stats.totalEnrollment / stats.totalCapacity) * 100)}% filled` : 'No limits set'}
        />
      </div>

      {/* Course Type Breakdown */}
      {stats.total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Type Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BeakerIcon className="w-5 h-5 text-blue-600 mr-2" />
                  <span>Sciences</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">{stats.sciences}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(stats.sciences / Math.max(stats.total, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <PaintBrushIcon className="w-5 h-5 text-orange-600 mr-2" />
                  <span>Arts</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">{stats.arts}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: `${(stats.arts / Math.max(stats.total, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <WrenchScrewdriverIcon className="w-5 h-5 text-purple-600 mr-2" />
                  <span>Technical</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">{stats.technical}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${(stats.technical / Math.max(stats.total, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpenIcon className="w-5 h-5 text-green-600 mr-2" />
                  <span>Mixed</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">{stats.mixed}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(stats.mixed / Math.max(stats.total, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Level Distribution</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.aLevel}</div>
                <div className="text-sm text-gray-500">A-Level Courses</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(stats.aLevel / Math.max(stats.total, 1)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.oLevel}</div>
                <div className="text-sm text-gray-500">O-Level Courses</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(stats.oLevel / Math.max(stats.total, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Courses Table */}
      {courses.length > 0 ? (
        <DataTable
          data={courses}
          columns={columns}
          searchable
          sortable
          pagination
          pageSize={10}
        />
      ) : (
        <div className="text-center py-12">
          <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first course combination.
          </p>
          {hasAnyRole(['ADMIN', 'HEAD_TEACHER']) && (
            <div className="mt-6">
              <Button onClick={handleAddCourse} className="flex items-center mx-auto">
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Course
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Course Registration Modal */}
      <CourseRegistration
        isOpen={showAddModal}
        onClose={handleModalClose}
        onSuccess={handleCourseSuccess}
        editingCourse={editingCourse}
      />

      {/* View Course Modal */}
      <AnimatePresence>
        {viewCourse && (
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
                      <AcademicCapIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{viewCourse.name}</h2>
                      <p className="text-primary-200 text-sm mt-0.5">{viewCourse.code}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          viewCourse.isActive !== false
                            ? 'bg-green-400/20 text-green-100 ring-1 ring-green-300/40'
                            : 'bg-red-400/20 text-red-100 ring-1 ring-red-300/40'
                        }`}>
                          {viewCourse.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewCourse(null)}
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
                    <p className="font-medium">{viewCourse.type || '—'}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Level</span>
                    <p className="font-medium">{viewCourse.level || '—'}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Enrollment</span>
                    <p className="font-medium">{viewCourse.currentEnrollment || 0}{viewCourse.maxStudents > 0 ? ` / ${viewCourse.maxStudents}` : ''}</p>
                  </div>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                {/* Course Info */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-b border-gray-200">
                    <span className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                      <AcademicCapIcon className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="text-sm font-semibold text-blue-800">Course Details</h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Code', viewCourse.code],
                        ['Name', viewCourse.name],
                        ['Type', viewCourse.type],
                        ['Level', viewCourse.level],
                        ['Enrollment', viewCourse.currentEnrollment || 0],
                        ['Max Students', viewCourse.maxStudents > 0 ? viewCourse.maxStudents : 'Unlimited'],
                        ['Status', viewCourse.isActive !== false ? 'Active' : 'Inactive'],
                      ].filter(([, v]) => v != null && v !== '').map(([label, val], i) => (
                        <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-500 font-medium w-44">{label}</td>
                          <td className="px-4 py-2 text-gray-900">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Principal Subjects */}
                {Array.isArray(viewCourse.principalSubjects) && viewCourse.principalSubjects.length > 0 && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-sky-50 border-b border-gray-200">
                      <span className="w-5 h-5 rounded bg-sky-600 flex items-center justify-center">
                        <BookOpenIcon className="w-3 h-3 text-white" />
                      </span>
                      <h3 className="text-sm font-semibold text-sky-800">Principal Subjects</h3>
                    </div>
                    <div className="px-4 py-3 flex flex-wrap gap-2">
                      {viewCourse.principalSubjects.map((subj, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-800 border border-sky-200">
                          {subj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subsidiary Subjects */}
                {Array.isArray(viewCourse.subsidiarySubjects) && viewCourse.subsidiarySubjects.length > 0 && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border-b border-gray-200">
                      <span className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center">
                        <BeakerIcon className="w-3 h-3 text-white" />
                      </span>
                      <h3 className="text-sm font-semibold text-emerald-800">Subsidiary Subjects</h3>
                    </div>
                    <div className="px-4 py-3 flex flex-wrap gap-2">
                      {viewCourse.subsidiarySubjects.map((subj, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {subj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {(viewCourse.description || viewCourse.requirements || viewCourse.careerPaths) && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-gray-200">
                      <span className="w-5 h-5 rounded bg-amber-600 flex items-center justify-center">
                        <PaintBrushIcon className="w-3 h-3 text-white" />
                      </span>
                      <h3 className="text-sm font-semibold text-amber-800">Additional Information</h3>
                    </div>
                    <table className="w-full text-sm">
                      <tbody>
                        {[
                          ['Description', viewCourse.description],
                          ['Requirements', viewCourse.requirements],
                          ['Career Paths', viewCourse.careerPaths],
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
                <span className="text-xs text-gray-500">{viewCourse.code} — {viewCourse.level}</span>
                <div className="flex gap-2">
                  {hasAnyRole(['ADMIN', 'HEAD_TEACHER']) && (
                    <button
                      onClick={() => { setViewCourse(null); handleEditCourse(viewCourse) }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-yellow-300 rounded-lg text-yellow-700 hover:bg-yellow-50 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => setViewCourse(null)}
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
    </div>
  )
}



export default Courses