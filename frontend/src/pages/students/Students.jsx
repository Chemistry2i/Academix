import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import StatCard from '../../components/common/StatCard'
import StudentRegistration from '../../components/students/StudentRegistration'
import { useAuth } from '../../contexts/AuthContext'
import { studentService } from '../../services/studentService'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

const Students = () => {
  const { hasAnyRole } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0
  })
  
  // Registration modal state
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)

  // Load students from backend
  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const data = await studentService.getStudents()
      
      // Handle different response formats from backend
      const studentsList = data.students || data || []
      const totalCount = data.totalStudents || studentsList.length
      
      setStudents(studentsList)
      setStats({
        total: totalCount,
        active: studentsList.filter(s => s.isActive !== false).length,
        newThisMonth: studentsList.filter(s => {
          if (!s.createdAt) return false
          const createdDate = new Date(s.createdAt)
          const now = new Date()
          return createdDate.getMonth() === now.getMonth() && 
                 createdDate.getFullYear() === now.getFullYear()
        }).length
      })
    } catch (error) {
      console.error('Failed to load students:', error)
      toast.error('Failed to load students from server')
      // Set empty state instead of mock data
      setStudents([])
      setStats({ total: 0, active: 0, newThisMonth: 0 })
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'studentId',
      header: 'Student ID',
      render: (value) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Full Name',
      render: (_, student) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium text-sm mr-3">
            {student.firstName?.[0] || '?'}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {student.firstName} {student.lastName}
            </div>
            <div className="text-sm text-gray-500">{student.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'class',
      header: 'Class',
      render: (_, student) => (
        <div>
          <div className="font-medium">
            {student.currentClass || student.schoolClass?.name || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">
            {student.stream || 'N/A'}
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
      key: 'status',
      header: 'Status',
      render: (value, student) => {
        const isActive = student.isActive !== undefined ? student.isActive : student.status === 'Active'
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        )
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, student) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewStudent(student)}
            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          {hasAnyRole(['ADMIN', 'TEACHER']) && (
            <button
              onClick={() => handleEditStudent(student)}
              className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded transition-colors"
              title="Edit Student"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          {hasAnyRole(['ADMIN']) && (
            <button
              onClick={() => handleDeleteStudent(student)}
              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
              title="Delete Student"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ]

  const handleViewStudent = (student) => {
    const className = student.currentClass || student.schoolClass?.name || 'N/A'
    const residenceStatus = student.residenceStatus === 'BOARDING' ? 'Boarding' : 'Day'
    
    Swal.fire({
      title: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
      html: `
        <div class="text-left space-y-2">
          <p><strong>Student ID:</strong> ${student.studentId || 'N/A'}</p>
          <p><strong>Email:</strong> ${student.email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${student.phoneNumber || 'N/A'}</p>
          <p><strong>Class:</strong> ${className}</p>
          <p><strong>Stream:</strong> ${student.stream || 'N/A'}</p>
          <p><strong>Gender:</strong> ${student.gender || 'N/A'}</p>
          <p><strong>Residence:</strong> ${residenceStatus}</p>
          ${student.house ? `<p><strong>House:</strong> ${student.house}</p>` : ''}
          <p><strong>Status:</strong> ${student.isActive !== false ? 'Active' : 'Inactive'}</p>
          ${student.nin ? `<p><strong>NIN:</strong> ${student.nin}</p>` : ''}
          ${student.linn ? `<p><strong>LINN:</strong> ${student.linn}</p>` : ''}
        </div>
      `,
      icon: 'info',
      customClass: {
        container: 'font-outfit',
        popup: 'rounded-xl'
      }
    })
  }

  const handleEditStudent = (student) => {
    setEditingStudent(student)
    setIsRegistrationOpen(true)
  }

  const handleDeleteStudent = async (student) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete ${student.firstName} ${student.lastName} from the system.`,
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
        await studentService.deleteStudent(student.id)
        toast.success('Student deleted successfully')
        loadStudents() // Refresh the list
      } catch (error) {
        console.error('Failed to delete student:', error)
        toast.error('Failed to delete student')
      }
    }
  }

  const handleAddStudent = () => {
    setEditingStudent(null)
    setIsRegistrationOpen(true)
  }

  const handleRegistrationSuccess = (student) => {
    const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim()
    
    toast.success(
      editingStudent 
        ? `Student ${studentName} updated successfully!` 
        : `Student ${studentName} registered successfully!`
    )
    
    // Refresh the list to show updated data
    loadStudents()
  }

  const handleCloseRegistration = () => {
    setIsRegistrationOpen(false)
    setEditingStudent(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className="ml-3 text-gray-600">Loading students...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Manage student records and information</p>
        </div>
        {hasAnyRole(['ADMIN']) && (
          <Button onClick={handleAddStudent} className="flex items-center">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Student
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Students"
          value={stats.total}
          icon={AcademicCapIcon}
          color="blue"
        />
        <StatCard
          title="Active Students"
          value={stats.active}
          icon={AcademicCapIcon}
          color="green"
        />
        <StatCard
          title="New This Month"
          value={stats.newThisMonth}
          icon={AcademicCapIcon}
          color="purple"
        />
      </div>

      {/* Students Table */}
      {students.length > 0 ? (
        <DataTable
          data={students}
          columns={columns}
          searchable
          sortable
          pagination
          pageSize={10}
        />
      ) : (
        <div className="text-center py-12">
          <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first student.
          </p>
          {hasAnyRole(['ADMIN']) && (
            <div className="mt-6">
              <Button onClick={handleAddStudent} className="flex items-center mx-auto">
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Student
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Student Registration Modal */}
      <StudentRegistration
        isOpen={isRegistrationOpen}
        onClose={handleCloseRegistration}
        onSuccess={handleRegistrationSuccess}
        editingStudent={editingStudent}
      />
    </div>
  )
}

export default Students