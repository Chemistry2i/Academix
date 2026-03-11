import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
  XMarkIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  BookOpenIcon
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
  const [viewTeacher, setViewTeacher] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
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
          <div className="font-medium">{value?.name || value || 'N/A'}</div>
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
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewTeacher(teacher)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-blue-200 rounded text-blue-600 hover:bg-blue-50 transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
            View
          </button>
          {hasAnyRole(['ADMIN']) && (
            <>
              <button
                onClick={() => handleEditTeacher(teacher)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-yellow-200 rounded text-yellow-600 hover:bg-yellow-50 transition-colors"
                title="Edit Teacher"
              >
                <PencilIcon className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDeleteTeacher(teacher)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-red-200 rounded text-red-600 hover:bg-red-50 transition-colors"
                title="Delete Teacher"
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
            </>
          )}
        </div>
      )
    }
  ]

  const handleViewTeacher = async (teacher) => {
    setViewTeacher(teacher)
    setViewLoading(true)
    try {
      const detail = await teacherService.getTeacherById(teacher.id)
      setViewTeacher(detail)
    } catch (err) {
      console.error('Failed to load teacher details:', err)
    } finally {
      setViewLoading(false)
    }
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

      {/* View Teacher Modal */}
      <AnimatePresence>
        {viewTeacher && (
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
                      {viewTeacher.firstName?.[0] || ''}{viewTeacher.lastName?.[0] || ''}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{viewTeacher.firstName} {viewTeacher.lastName}</h2>
                      <p className="text-primary-200 text-sm mt-0.5">{viewTeacher.teacherId || 'No ID'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          viewTeacher.employmentStatus === 'ACTIVE'
                            ? 'bg-green-400/20 text-green-100 ring-1 ring-green-300/40'
                            : viewTeacher.employmentStatus === 'ON_LEAVE'
                            ? 'bg-yellow-400/20 text-yellow-100 ring-1 ring-yellow-300/40'
                            : 'bg-red-400/20 text-red-100 ring-1 ring-red-300/40'
                        }`}>
                          {viewTeacher.employmentStatus || 'ACTIVE'}
                        </span>
                        {viewTeacher.gender && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                            {viewTeacher.gender}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewTeacher(null)}
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
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Department</span>
                    <p className="font-medium">{viewTeacher.department?.name || viewTeacher.department || '—'}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Primary Subject</span>
                    <p className="font-medium">{viewTeacher.primarySubject || '—'}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Employment</span>
                    <p className="font-medium">{viewTeacher.employmentType || '—'}</p>
                  </div>
                  {viewTeacher.isClassTeacher && (
                    <div className="border-l border-primary-500 pl-4">
                      <span className="text-primary-300 text-xs uppercase tracking-wider">Class</span>
                      <p className="font-medium">{viewTeacher.classResponsibility || 'Yes'}</p>
                    </div>
                  )}
                  {viewTeacher.isDepartmentHead && (
                    <div className="border-l border-primary-500 pl-4">
                      <span className="text-primary-300 text-xs uppercase tracking-wider">Role</span>
                      <p className="font-medium">Dept. Head</p>
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

                {/* Professional Info */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-b border-gray-200">
                    <span className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                      <BriefcaseIcon className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="text-sm font-semibold text-blue-800">Professional Information</h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Reg. Number', viewTeacher.registrationNumber],
                        ['Date Joined', viewTeacher.dateJoined],
                        ['Contract End', viewTeacher.contractEndDate],
                        ['Qualifications', viewTeacher.qualifications],
                        ['Specialization', viewTeacher.specialization],
                        ['Experience', viewTeacher.yearsOfExperience != null ? `${viewTeacher.yearsOfExperience} years` : null],
                        ['Salary Grade', viewTeacher.salaryGrade],
                        ['Bank', viewTeacher.bankName],
                      ].filter(([, v]) => v != null && v !== '').map(([label, val], i) => (
                        <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-500 font-medium w-44">{label}</td>
                          <td className="px-4 py-2 text-gray-900">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subjects & Classes */}
                {(viewTeacher.subjects?.length > 0 || viewTeacher.assignedClasses?.length > 0) && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-sky-50 border-b border-gray-200">
                      <span className="w-5 h-5 rounded bg-sky-600 flex items-center justify-center">
                        <BookOpenIcon className="w-3 h-3 text-white" />
                      </span>
                      <h3 className="text-sm font-semibold text-sky-800">Subjects & Classes</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {viewTeacher.subjects?.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Subjects</p>
                          <div className="flex flex-wrap gap-1.5">
                            {viewTeacher.subjects.map((s, i) => (
                              <span key={i} className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                s === viewTeacher.primarySubject
                                  ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {s}{s === viewTeacher.primarySubject ? ' ★' : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {viewTeacher.assignedClasses?.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Assigned Classes</p>
                          <div className="flex flex-wrap gap-1.5">
                            {viewTeacher.assignedClasses.map((c, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
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
                        ['Email', viewTeacher.email],
                        ['Phone', viewTeacher.phoneNumber],
                        ['NIN', viewTeacher.nin],
                        ['Emergency Contact', viewTeacher.emergencyContactName],
                        ['Emergency Phone', viewTeacher.emergencyContactPhone],
                        ['Relationship', viewTeacher.emergencyContactRelationship],
                      ].filter(([, v]) => v != null && v !== '').map(([label, val], i) => (
                        <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-500 font-medium w-44">{label}</td>
                          <td className="px-4 py-2 text-gray-900">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Address */}
                {(viewTeacher.district || viewTeacher.village || viewTeacher.fullAddress) && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-gray-200">
                      <span className="w-5 h-5 rounded bg-amber-600 flex items-center justify-center">
                        <MapPinIcon className="w-3 h-3 text-white" />
                      </span>
                      <h3 className="text-sm font-semibold text-amber-800">Address</h3>
                    </div>
                    <table className="w-full text-sm">
                      <tbody>
                        {[
                          ['District', viewTeacher.district],
                          ['County', viewTeacher.county],
                          ['Sub-County', viewTeacher.subCounty],
                          ['Parish', viewTeacher.parish],
                          ['Village', viewTeacher.village],
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
                  {viewTeacher.createdAt
                    ? `Joined: ${new Date(viewTeacher.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
                    : ''}
                </span>
                <div className="flex gap-2">
                  {hasAnyRole(['ADMIN']) && (
                    <button
                      onClick={() => { setViewTeacher(null); handleEditTeacher(viewTeacher) }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-yellow-300 rounded-lg text-yellow-700 hover:bg-yellow-50 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => setViewTeacher(null)}
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

export default Teachers