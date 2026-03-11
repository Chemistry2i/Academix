import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon,
  HomeIcon,
  CalendarDaysIcon,
  BookOpenIcon
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

  // View modal state
  const [viewStudent, setViewStudent] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  
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
      key: 'gender',
      header: 'Gender',
      render: (_, student) => {
        const g = (student.gender || '').toUpperCase()
        if (!g) return <span className="text-gray-400 text-xs">N/A</span>
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            g === 'MALE' ? 'bg-blue-100 text-blue-700' :
            g === 'FEMALE' ? 'bg-pink-100 text-pink-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {g === 'MALE' ? 'M' : g === 'FEMALE' ? 'F' : g}
          </span>
        )
      }
    },
    {
      key: 'residenceStatus',
      header: 'Residence',
      render: (_, student) => {
        const isBoarding = student.residenceStatus === 'BOARDING'
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            isBoarding ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {isBoarding ? 'Boarding' : 'Day'}
          </span>
        )
      }
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
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewStudent(student)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-blue-200 rounded text-blue-600 hover:bg-blue-50 transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
            View
          </button>
          {hasAnyRole(['ADMIN', 'TEACHER']) && (
            <button
              onClick={() => handleEditStudent(student)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-yellow-200 rounded text-yellow-600 hover:bg-yellow-50 transition-colors"
              title="Edit Student"
            >
              <PencilIcon className="w-4 h-4" />
              Edit
            </button>
          )}
          {hasAnyRole(['ADMIN']) && (
            <button
              onClick={() => handleDeleteStudent(student)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-red-200 rounded text-red-600 hover:bg-red-50 transition-colors"
              title="Delete Student"
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      )
    }
  ]

  const handleViewStudent = async (student) => {
    setViewStudent(student) // show modal immediately with summary data
    setViewLoading(true)
    try {
      const full = await studentService.getStudentById(student.id)
      setViewStudent(full)
    } catch (e) {
      // keep the summary data already shown
    } finally {
      setViewLoading(false)
    }
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

      {/* Student View Modal */}
      <AnimatePresence>
        {viewStudent && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden"
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
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                      {viewStudent.firstName?.[0] || ''}{viewStudent.lastName?.[0] || ''}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {[viewStudent.firstName, viewStudent.otherNames, viewStudent.lastName].filter(Boolean).join(' ')}
                      </h2>
                      <p className="text-primary-200 text-sm mt-0.5">{viewStudent.studentId || 'No ID'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          viewStudent.isActive !== false
                            ? 'bg-green-400/20 text-green-100 ring-1 ring-green-300/40'
                            : 'bg-red-400/20 text-red-100 ring-1 ring-red-300/40'
                        }`}>
                          {viewStudent.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                        {viewStudent.gender && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                            {viewStudent.gender}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewStudent(null)}
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
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Class</span>
                    <p className="font-medium">{viewStudent.currentClass || viewStudent.schoolClass?.name || '—'}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Stream</span>
                    <p className="font-medium">{viewStudent.stream || '—'}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Residence</span>
                    <p className="font-medium">{viewStudent.residenceStatus === 'BOARDING' ? 'Boarding' : 'Day Scholar'}</p>
                  </div>
                  {viewStudent.house && (
                    <div className="border-l border-primary-500 pl-4">
                      <span className="text-primary-300 text-xs uppercase tracking-wider">House</span>
                      <p className="font-medium">{viewStudent.house}</p>
                    </div>
                  )}
                  {viewStudent.linn && (
                    <div className="border-l border-primary-500 pl-4">
                      <span className="text-primary-300 text-xs uppercase tracking-wider">LINN</span>
                      <p className="font-medium">{viewStudent.linn}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                {viewLoading && (
                  <div className="flex items-center justify-center py-6">
                    <motion.div
                      className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <span className="ml-2 text-sm text-gray-500">Loading full details…</span>
                  </div>
                )}

                {/* Personal Information */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-b border-gray-200">
                    <span className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                      <UserIcon className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="text-sm font-semibold text-blue-800">Personal Information</h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Full Name', [viewStudent.firstName, viewStudent.otherNames, viewStudent.lastName].filter(Boolean).join(' ')],
                        ['Date of Birth', viewStudent.dateOfBirth ? new Date(viewStudent.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : null],
                        ['Gender', viewStudent.gender],
                        ['Nationality', viewStudent.nationality],
                        ['NIN', viewStudent.nin],
                        viewStudent.disabilityStatus ? ['Disability Status', viewStudent.disabilityStatus] : null,
                      ].filter(row => row && row[1] != null && row[1] !== '').map(([label, val], i) => (
                        <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-500 font-medium w-44">{label}</td>
                          <td className="px-4 py-2 text-gray-900">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Contact Information */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border-b border-gray-200">
                    <span className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center">
                      <PhoneIcon className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="text-sm font-semibold text-emerald-800">Contact Information</h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Email', viewStudent.email],
                        ['Phone Number', viewStudent.phoneNumber],
                        viewStudent.combination ? ['Subject Combination', viewStudent.combination] : null,
                      ].filter(row => row && row[1] != null && row[1] !== '').map(([label, val], i) => (
                        <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-500 font-medium w-44">{label}</td>
                          <td className="px-4 py-2 text-gray-900 break-all">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Address */}
                {(viewStudent.district || viewStudent.county || viewStudent.subCounty || viewStudent.parish || viewStudent.village) && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-gray-200">
                      <span className="w-5 h-5 rounded bg-amber-600 flex items-center justify-center">
                        <MapPinIcon className="w-3 h-3 text-white" />
                      </span>
                      <h3 className="text-sm font-semibold text-amber-800">Home Address</h3>
                    </div>
                    <table className="w-full text-sm">
                      <tbody>
                        {[
                          ['District', viewStudent.district],
                          ['County', viewStudent.county],
                          ['Sub-County', viewStudent.subCounty],
                          ['Parish', viewStudent.parish],
                          ['Village', viewStudent.village],
                        ].filter(([, v]) => v != null && v !== '').map(([label, val], i) => (
                          <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2 text-gray-500 font-medium w-44">{label}</td>
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
                <span className="text-xs text-gray-500">
                  {viewStudent.createdAt
                    ? `Enrolled: ${new Date(viewStudent.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
                    : ''}
                </span>
                <div className="flex gap-2">
                  {hasAnyRole(['ADMIN', 'TEACHER']) && (
                    <button
                      onClick={() => { setViewStudent(null); handleEditStudent(viewStudent) }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-yellow-300 rounded-lg text-yellow-700 hover:bg-yellow-50 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => setViewStudent(null)}
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

export default Students