import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BuildingOffice2Icon, 
  PlusIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  MapPinIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import DepartmentRegistration from '../components/departments/DepartmentRegistration'
import departmentService from '../services/departmentService'

const Departments = () => {
  const [filter, setFilter] = useState('all')
  const [departments, setDepartments] = useState([])
  const [statistics, setStatistics] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showRegistration, setShowRegistration] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [viewDepartment, setViewDepartment] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  // Load departments and statistics on component mount
  useEffect(() => {
    loadDepartments()
    loadStatistics()
  }, [])

  // Reload data when filter or search term changes
  useEffect(() => {
    if (!loading) {
      loadDepartments()
    }
  }, [filter, searchTerm])

  const loadDepartments = async () => {
    try {
      setError(null)
      const searchParams = {
        search: searchTerm,
        status: filter !== 'all' ? filter : undefined
      }
      
      const response = await departmentService.getAllDepartments(searchParams)
      
      if (response.success) {
        const formattedDepartments = departmentService.formatDepartmentData(response.data)
        setDepartments(formattedDepartments)
      }
    } catch (error) {
      console.error('Error loading departments:', error)
      // Don't set error - just use empty departments array
      setDepartments([])
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const response = await departmentService.getDepartmentStatistics()
      
      if (response.success) {
        setStatistics(response.data)
      }
    } catch (error) {
      console.error('Error loading department statistics:', error)
      // Use fallback/default statistics when API fails
      setStatistics({
        activeDepartments: 0,
        totalDepartments: 0,
        totalTeachers: 0,
        totalSubjects: 0
      })
    }
  }

  const handleCreateDepartment = () => {
    setEditingDepartment(null)
    setShowRegistration(true)
  }

  const handleEditDepartment = (department) => {
    setEditingDepartment(department)
    setShowRegistration(true)
  }

  const handleViewDepartment = (department) => {
    setViewDepartment(department)
  }

  const handleDeleteDepartment = async (departmentId) => {
    if (!window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return
    }

    setActionLoading(departmentId)
    try {
      await departmentService.deleteDepartment(departmentId)
      await loadDepartments()
      await loadStatistics()
    } catch (error) {
      console.error('Error deleting department:', error)
      alert(`Failed to delete department: ${error.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRegistrationSuccess = () => {
    setShowRegistration(false)
    setEditingDepartment(null)
    loadDepartments()
    loadStatistics()
  }

  const handleCloseRegistration = () => {
    setShowRegistration(false)
    setEditingDepartment(null)
  }

  // Calculate display statistics from backend data
  const getDisplayStats = () => {
    const activeCount = statistics.activeDepartments || 0
    const totalCount = statistics.totalDepartments || 0
    const totalTeachers = statistics.totalTeachers || 0
    const totalSubjects = statistics.totalSubjects || 0
    
    return [
      { 
        title: 'Total Departments', 
        value: totalCount.toString(), 
        change: '+0', 
        trend: 'neutral',
        icon: BuildingOffice2Icon
      },
      { 
        title: 'Active Departments', 
        value: activeCount.toString(), 
        change: '+0', 
        trend: 'up',
        icon: BuildingOffice2Icon
      },
      { 
        title: 'Total Teachers', 
        value: totalTeachers.toString(), 
        change: '+0', 
        trend: 'up',
        icon: UserGroupIcon
      },
      { 
        title: 'Subjects Offered', 
        value: totalSubjects.toString(), 
        change: '+0', 
        trend: 'up',
        icon: BookOpenIcon
      }
    ]
  }

  const columns = [
    { key: 'name', header: 'Department' },
    { 
      key: 'departmentCode', 
      header: 'Code',
      render: (value) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">
          {value || 'N/A'}
        </span>
      )
    },
    { 
      key: 'head', 
      header: 'Department Head',
      render: (value) => (
        <p className="font-medium text-gray-900">{value}</p>
      )
    },
    { 
      key: 'teachers', 
      header: 'Teachers',
      render: (value) => (
        <div className="flex items-center gap-1">
          <UserGroupIcon className="h-4 w-4 text-gray-500" />
          <span>{value}</span>
        </div>
      )
    },
    { 
      key: 'subjects', 
      header: 'Subjects',
      render: (value) => (
        <div className="flex items-center gap-1">
          <BookOpenIcon className="h-4 w-4 text-gray-500" />
          <span>{value}</span>
        </div>
      )
    },
    { 
      key: 'students', 
      header: 'Students',
      render: (value) => (
        <div className="flex items-center gap-1">
          <AcademicCapIcon className="h-4 w-4 text-gray-500" />
          <span>{value}</span>
        </div>
      )
    },
    { key: 'established', header: 'Established' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Active' ? 'bg-green-100 text-green-800' :
          value === 'Inactive' ? 'bg-gray-100 text-gray-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: 'actions', 
      header: 'Actions',
      render: (value, row) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDepartment(row)}
            className="inline-flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
          >
            <EyeIcon className="h-4 w-4" />
            View
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleEditDepartment(row)}
            className="inline-flex items-center gap-1 text-yellow-600 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleDeleteDepartment(row.id)}
            disabled={actionLoading === row.id}
            className="inline-flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            {actionLoading === row.id ? (
              <LoadingSpinner size="xs" />
            ) : (
              <>
                <TrashIcon className="h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </div>
      )
    }
  ]

  // Display loading spinner while data loads
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  const displayStats = getDisplayStats()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600">Manage academic departments and their structure</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105" 
            onClick={handleCreateDepartment}
          >
            <PlusIcon className="h-5 w-5" />
            Create Department
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">All Departments</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64"
              />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Departments</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
          
          {departments.length === 0 ? (
            <div className="text-center py-8">
              <BuildingOffice2Icon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Departments Found</h3>
              <p className="text-gray-600 mb-4">
                {filter !== 'all' || searchTerm ? 
                'No departments match your current filters.' : 
                'Get started by creating your first department.'}
              </p>
              <Button className="flex items-center gap-2" onClick={handleCreateDepartment}>
                <PlusIcon className="h-5 w-5" />
                Create Department
              </Button>
            </div>
          ) : (
            <DataTable
              data={departments}
              columns={columns}
              searchPlaceholder="Search departments..."
            />
          )}
        </div>
      </Card>
      
      {/* Department Registration Modal */}
      {showRegistration && (
        <DepartmentRegistration
          onClose={handleCloseRegistration}
          onSuccess={handleRegistrationSuccess}
          editDepartment={editingDepartment}
        />
      )}

      <AnimatePresence>
        {viewDepartment && (
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
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                      <BuildingOffice2Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{viewDepartment.name}</h2>
                      <p className="text-primary-200 text-sm mt-0.5">{viewDepartment.departmentCode || 'No Code'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          viewDepartment.status === 'Active'
                            ? 'bg-green-400/20 text-green-100 ring-1 ring-green-300/40'
                            : viewDepartment.status === 'Inactive'
                            ? 'bg-gray-200/20 text-gray-100 ring-1 ring-gray-300/40'
                            : 'bg-yellow-400/20 text-yellow-100 ring-1 ring-yellow-300/40'
                        }`}>
                          {viewDepartment.status || 'Unknown'}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                          {viewDepartment.isCoreDepartment ? 'Core Department' : 'Support Department'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewDepartment(null)}
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
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Department Head</span>
                    <p className="font-medium">{viewDepartment.head || 'Not Assigned'}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Teachers</span>
                    <p className="font-medium">{viewDepartment.teachers || 0}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Subjects</span>
                    <p className="font-medium">{viewDepartment.subjects || 0}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Students</span>
                    <p className="font-medium">{viewDepartment.students || 0}</p>
                  </div>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-b border-gray-200">
                    <span className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                      <BuildingOffice2Icon className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="text-sm font-semibold text-blue-800">Department Profile</h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Department Name', viewDepartment.name],
                        ['Department Code', viewDepartment.departmentCode || 'N/A'],
                        ['Established Year', viewDepartment.established || 'N/A'],
                        ['Status', viewDepartment.status || 'N/A'],
                        ['Academic Focus', viewDepartment.academicFocus || 'Not specified'],
                        ['Core Department', viewDepartment.isCoreDepartment ? 'Yes' : 'No'],
                      ].map(([label, value], index) => (
                        <tr key={label} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-500 font-medium w-52">{label}</td>
                          <td className="px-4 py-2 text-gray-900">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-sky-50 border-b border-gray-200">
                    <span className="w-5 h-5 rounded bg-sky-600 flex items-center justify-center">
                      <UserGroupIcon className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="text-sm font-semibold text-sky-800">Leadership & Capacity</h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Department Head', viewDepartment.head || 'Not Assigned'],
                        ['Teacher Count', viewDepartment.teachers || 0],
                        ['Subject Count', viewDepartment.subjects || 0],
                        ['Student Count', viewDepartment.students || 0],
                        ['Staff Count', viewDepartment.staff || 0],
                        ['Minimum Staff Required', viewDepartment.minimumStaff ?? 'Not specified'],
                        ['Target Enrollment', viewDepartment.targetEnrollment ?? 'Not specified'],
                      ].map(([label, value], index) => (
                        <tr key={label} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-500 font-medium w-52">{label}</td>
                          <td className="px-4 py-2 text-gray-900">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border-b border-gray-200">
                    <span className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center">
                      <MapPinIcon className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="text-sm font-semibold text-emerald-800">Location & Contact</h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Building', viewDepartment.building || 'Not specified'],
                        ['Floor', viewDepartment.floor || 'Not specified'],
                        ['Office Room', viewDepartment.officeRoom || 'Not specified'],
                        ['Phone', viewDepartment.phoneNumber || 'Not specified'],
                        ['Email', viewDepartment.email || 'Not specified'],
                      ].map(([label, value], index) => (
                        <tr key={label} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-500 font-medium w-52">{label}</td>
                          <td className="px-4 py-2 text-gray-900">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {(viewDepartment.description || viewDepartment.visionStatement || viewDepartment.missionStatement) && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-gray-200">
                      <span className="w-5 h-5 rounded bg-amber-600 flex items-center justify-center">
                        <DocumentTextIcon className="w-3 h-3 text-white" />
                      </span>
                      <h3 className="text-sm font-semibold text-amber-800">Narrative Details</h3>
                    </div>
                    <table className="w-full text-sm">
                      <tbody>
                        {[
                          ['Description', viewDepartment.description],
                          ['Vision Statement', viewDepartment.visionStatement],
                          ['Mission Statement', viewDepartment.missionStatement],
                        ].filter(([, value]) => value != null && value !== '').map(([label, value], index) => (
                          <tr key={label} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2 text-gray-500 font-medium w-52 align-top">{label}</td>
                            <td className="px-4 py-2 text-gray-900">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
                <span className="text-xs text-gray-500">{viewDepartment.departmentCode || 'N/A'} - {viewDepartment.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setViewDepartment(null)
                      handleEditDepartment(viewDepartment)
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-yellow-300 rounded-lg text-yellow-700 hover:bg-yellow-50 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setViewDepartment(null)}
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

export default Departments