import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  UserGroupIcon
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
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    sciences: 0,
    arts: 0,
    technical: 0,
    mixed: 0,
    aLevel: 0,
    oLevel: 0,
    totalEnrollment: 0,
    totalCapacity: 0,
    averageEnrollment: 0
  })

  // Load courses from backend
  useEffect(() => {
    loadCourses()
    loadStatistics()
  }, [])

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

  const loadStatistics = async () => {
    try {
      const statisticsData = await courseService.getCourseStatistics()
      setStats({
        total: statisticsData.total || 0,
        active: statisticsData.active || 0,
        sciences: statisticsData.sciences || 0,
        arts: statisticsData.arts || 0,
        technical: statisticsData.technical || 0,
        mixed: statisticsData.mixed || 0,
        aLevel: statisticsData.aLevel || 0,
        oLevel: statisticsData.oLevel || 0,
        totalEnrollment: statisticsData.totalEnrollment || 0,
        totalCapacity: statisticsData.totalCapacity || 0,
        averageEnrollment: statisticsData.totalEnrollment && statisticsData.active 
          ? Math.round(statisticsData.totalEnrollment / statisticsData.active) 
          : 0
      })
    } catch (error) {
      console.error('Failed to load course statistics:', error)
      // Keep existing fallback stats calculation
      setStats(prev => prev)
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
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewCourse(course)}
            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          {hasAnyRole(['ADMIN', 'HEAD_TEACHER']) && (
            <>
              <button
                onClick={() => handleEditCourse(course)}
                className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded transition-colors"
                title="Edit Course"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              {hasAnyRole(['ADMIN']) && (
                <button
                  onClick={() => handleDeleteCourse(course)}
                  className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                  title="Delete Course"
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

  const handleViewCourse = (course) => {
    const principalSubjects = Array.isArray(course.principalSubjects) 
      ? course.principalSubjects.join(', ') 
      : 'None'
    const subsidiarySubjects = Array.isArray(course.subsidiarySubjects)
      ? course.subsidiarySubjects.join(', ')
      : 'None'
    
    Swal.fire({
      title: `${course.code} - ${course.name}`,
      html: `
        <div class="text-left space-y-2">
          <p><strong>Code:</strong> ${course.code}</p>
          <p><strong>Type:</strong> ${course.type}</p>
          <p><strong>Level:</strong> ${course.level}</p>
          <p><strong>Principal Subjects:</strong> ${principalSubjects}</p>
          <p><strong>Subsidiary Subjects:</strong> ${subsidiarySubjects}</p>
          <p><strong>Current Enrollment:</strong> ${course.currentEnrollment || 0}</p>
          ${course.maxStudents > 0 ? `<p><strong>Max Students:</strong> ${course.maxStudents}</p>` : ''}
          ${course.description ? `<p><strong>Description:</strong> ${course.description}</p>` : ''}
          ${course.requirements ? `<p><strong>Requirements:</strong> ${course.requirements}</p>` : ''}
          ${course.careerPaths ? `<p><strong>Career Paths:</strong> ${course.careerPaths}</p>` : ''}
          <p><strong>Status:</strong> ${course.isActive !== false ? 'Active' : 'Inactive'}</p>
        </div>
      `,
      icon: 'info',
      customClass: {
        container: 'font-outfit',
        popup: 'rounded-xl'
      }
    })
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
        loadStatistics() // Refresh the statistics
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
    loadStatistics() // Refresh the statistics
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
          subtitle="PCM, PCB, BCM"
        />
        <StatCard
          title="Arts"
          value={stats.arts}
          icon={PaintBrushIcon}
          color="orange"
          subtitle="HEG, HEL, GEL"
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
    </div>
  )
}



export default Courses