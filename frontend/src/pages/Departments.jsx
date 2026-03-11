import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BuildingOffice2Icon, 
  PlusIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
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
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleEditDepartment(row)}
            className="p-1"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => handleDeleteDepartment(row.id)}
            disabled={actionLoading === row.id}
            className="p-1 text-red-600 hover:text-red-700"
          >
            {actionLoading === row.id ? (
              <LoadingSpinner size="xs" />
            ) : (
              <TrashIcon className="h-4 w-4" />
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
    </div>
  )
}

export default Departments