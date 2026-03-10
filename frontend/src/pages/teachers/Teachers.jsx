import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import Button from '../../components/common/Button'
import StatCard from '../../components/common/StatCard'
import DataTable from '../../components/common/DataTable'
import TeacherRegistration from '../../components/teachers/TeacherRegistration'
import { useAuth } from '../../contexts/AuthContext'
import { teacherService } from '../../services/teacherService'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

const Teachers = () => {
  const { hasAnyRole } = useAuth()
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0
  })

  // Load teachers from backend
  useEffect(() => {
    loadTeachers()
  }, [])

  const loadTeachers = async () => {
    try {
      setLoading(true)
      const data = await teacherService.getTeachers()
      
      // Handle different response formats from backend
      const teachersList = data.teachers || data || []
      const totalCount = data.totalTeachers || teachersList.length
      
      setTeachers(teachersList)
      setStats({
        total: totalCount,
        active: teachersList.filter(t => 
          t.isActive !== false && 
          t.employmentStatus === 'ACTIVE'
        ).length,
        onLeave: teachersList.filter(t => 
          t.employmentStatus === 'ON_LEAVE'
        ).length
      })
    } catch (error) {
      console.error('Failed to load teachers:', error)
      toast.error('Failed to load teachers from server')
      // Set empty state instead of mock data
      setTeachers([])
      setStats({ total: 0, active: 0, onLeave: 0 })
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'teacherId',
      header: 'Teacher ID',
      render: (value) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Full Name',
      render: (_, teacher) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-medium text-sm mr-3">
            {teacher.firstName?.[0] || '?'}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {teacher.firstName} {teacher.lastName}
            </div>
            <div className="text-sm text-gray-500">{teacher.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      header: 'Department',
      render: (value, teacher) => (
        <div>
          <div className="font-medium">{value || 'N/A'}</div>
          <div className="text-sm text-gray-500">
            {teacher.primarySubject || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'phoneNumber',
      header: 'Phone',
      render: (value) => value || 'N/A'
    },
    {
      key: 'employmentType',
      header: 'Employment',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'PERMANENT'
            ? 'bg-green-100 text-green-800'
            : value === 'CONTRACT'
            ? 'bg-yellow-100 text-yellow-800'
            : value === 'PART_TIME'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value, teacher) => {
        const status = teacher.employmentStatus || 'ACTIVE'
        const isActive = teacher.isActive !== false && status === 'ACTIVE'
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive
              ? 'bg-green-100 text-green-800'
              : status === 'ON_LEAVE'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {status}
          </span>
        )
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, teacher) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewTeacher(teacher)}
            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          {hasAnyRole(['ADMIN']) && (
            <>
              <button
                onClick={() => handleEditTeacher(teacher)}
                className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded transition-colors"
                title="Edit Teacher"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteTeacher(teacher)}
                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                title="Delete Teacher"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ]

  const handleViewTeacher = (teacher) => {
    const subjects = Array.isArray(teacher.subjects) 
      ? teacher.subjects.join(', ') 
      : teacher.primarySubject || 'N/A'
    const employmentStatus = teacher.employmentStatus === 'ACTIVE' ? 'Active' : teacher.employmentStatus
    
    Swal.fire({
      title: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim(),
      html: `
        <div class="text-left space-y-2">
          <p><strong>Teacher ID:</strong> ${teacher.teacherId || 'N/A'}</p>
          <p><strong>Email:</strong> ${teacher.email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${teacher.phoneNumber || 'N/A'}</p>
          <p><strong>Department:</strong> ${teacher.department || 'N/A'}</p>
          <p><strong>Subjects:</strong> ${subjects}</p>
          <p><strong>Employment Type:</strong> ${teacher.employmentType || 'N/A'}</p>
          <p><strong>Status:</strong> ${employmentStatus}</p>
          ${teacher.qualifications ? `<p><strong>Qualifications:</strong> ${teacher.qualifications}</p>` : ''}
          ${teacher.yearsOfExperience ? `<p><strong>Experience:</strong> ${teacher.yearsOfExperience} years</p>` : ''}
          ${teacher.isClassTeacher ? `<p><strong>Class Teacher:</strong> ${teacher.classResponsibility || 'Yes'}</p>` : ''}
          ${teacher.isDepartmentHead ? '<p><strong>Department Head:</strong> Yes</p>' : ''}
        </div>
      `,
      icon: 'info',
      customClass: {
        container: 'font-outfit',
        popup: 'rounded-xl'
      }
    })
  }

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher)
    setShowAddModal(true)
  }

  const handleDeleteTeacher = async (teacher) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete ${teacher.firstName} ${teacher.lastName} from the system.`,
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
        await teacherService.deleteTeacher(teacher.id)
        toast.success('Teacher deleted successfully')
        loadTeachers() // Refresh the list
      } catch (error) {
        console.error('Failed to delete teacher:', error)
        toast.error('Failed to delete teacher')
      }
    }
  }

  const handleAddTeacher = () => {
    setEditingTeacher(null)
    setShowAddModal(true)
  }

  const handleModalClose = () => {
    setShowAddModal(false)
    setEditingTeacher(null)
  }

  const handleTeacherSuccess = () => {
    loadTeachers() // Refresh the teachers list
    setShowAddModal(false)
    setEditingTeacher(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className="ml-3 text-gray-600">Loading teachers...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-600 mt-1">Manage teaching staff and assignments</p>
        </div>
        {hasAnyRole(['ADMIN']) && (
          <Button onClick={handleAddTeacher} className="flex items-center">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Teacher
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Teachers"
          value={stats.total}
          icon={UserGroupIcon}
          color="green"
        />
        <StatCard
          title="Active Teachers"
          value={stats.active}
          icon={UserGroupIcon}
          color="blue"
        />
        <StatCard
          title="On Leave"
          value={stats.onLeave}
          icon={UserGroupIcon}
          color="yellow"
        />
      </div>

      {/* Teachers Table */}
      {teachers.length > 0 ? (
        <DataTable
          data={teachers}
          columns={columns}
          searchable
          sortable
          pagination
          pageSize={10}
        />
      ) : (
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No teachers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first teacher.
          </p>
          {hasAnyRole(['ADMIN']) && (
            <div className="mt-6">
              <Button onClick={handleAddTeacher} className="flex items-center mx-auto">
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Teacher
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Teacher Registration Modal */}
      <TeacherRegistration
        isOpen={showAddModal}
        onClose={handleModalClose}
        onSuccess={handleTeacherSuccess}
        editingTeacher={editingTeacher}
      />
    </div>
  )
}

export default Teachers