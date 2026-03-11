import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  UsersIcon, 
  PlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import StaffRegistration from '../components/staff/StaffRegistration'
import toast from 'react-hot-toast'
import { staffService } from '../services/staffService'

const Staff = () => {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ department: '', status: '', search: '' })
  const [showRegistration, setShowRegistration] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [editingStaff, setEditingStaff] = useState(null)
  const [statistics, setStatistics] = useState({})
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    loadStaff()
    loadStatistics()
    loadDepartments()
  }, [filters])

  const loadStaff = async () => {
    try {
      setLoading(true)
      const response = await staffService.getStaff(filters)
      setStaff(response.staff || [])
    } catch (error) {
      console.error('Error loading staff:', error)
      toast.error('Failed to load staff data')
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const stats = await staffService.getStaffStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error('Error loading statistics:', error)
    }
  }

  const loadDepartments = async () => {
    try {
      const depts = await staffService.getDepartments()
      setDepartments(depts)
    } catch (error) {
      console.error('Error loading departments:', error)
    }
  }

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember)
    setShowRegistration(true)
  }

  const handleView = (staffMember) => {
    setSelectedStaff(staffMember)
    setShowViewModal(true)
  }

  const handleDelete = async (staffMember) => {
    if (window.confirm(`Are you sure you want to delete ${staffMember.fullName}?`)) {
      try {
        await staffService.deleteStaff(staffMember.id)
        toast.success('Staff member deleted successfully')
        loadStaff()
        loadStatistics()
      } catch (error) {
        console.error('Error deleting staff:', error)
        toast.error('Failed to delete staff member')
      }
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const openCreateModal = () => {
    setEditingStaff(null)
    setShowRegistration(true)
  }

  const handleRegistrationSuccess = () => {
    loadStaff()
    loadStatistics()
  }

  const getStatsCards = () => {
    return [
      { 
        title: 'Total Staff', 
        value: statistics.totalStaff?.toString() || '0', 
        change: '+0', 
        trend: 'neutral',
        icon: UsersIcon
      },
      { 
        title: 'Active Staff', 
        value: statistics.activeStaff?.toString() || '0', 
        change: '+0', 
        trend: 'up',
        icon: BriefcaseIcon
      },
      { 
        title: 'On Leave', 
        value: statistics.onLeave?.toString() || '0', 
        change: '+0', 
        trend: 'up',
        icon: PhoneIcon
      },
      { 
        title: 'Departments', 
        value: statistics.departments?.toString() || '0', 
        change: '0', 
        trend: 'neutral',
        icon: EnvelopeIcon
      }
    ]
  }

  const columns = [
    { 
      key: 'fullName', 
      header: 'Staff Member',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value || `${row.firstName} ${row.lastName}`}</p>
          <p className="text-sm text-gray-500">{row.staffId}</p>
        </div>
      )
    },
    { key: 'department', header: 'Department' },
    { key: 'position', header: 'Position' },
    { 
      key: 'email', 
      header: 'Contact',
      render: (value, row) => (
        <div>
          <p className="text-sm text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{row.phoneNumber}</p>
        </div>
      )
    },
    { 
      key: 'joinDate',
      header: 'Join Date',
      render: (value) => (
        <span>
          {value ? new Date(value).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => {
        const getStatusStyle = (status) => {
          switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800'
            case 'ON_LEAVE': return 'bg-yellow-100 text-yellow-800'
            case 'INACTIVE': return 'bg-gray-100 text-gray-800'
            case 'SUSPENDED': return 'bg-red-100 text-red-800'
            case 'TERMINATED': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
          }
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(value)}`}>
            {staffService.getStatusDisplay(value)}
          </span>
        )
      }
    },
    { 
      key: 'actions', 
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleView(row)}
            className="flex items-center gap-1"
          >
            <EyeIcon className="h-4 w-4" />
            View
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleEdit(row)}
            className="flex items-center gap-1"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => handleDelete(row)}
            className="flex items-center gap-1"
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage non-teaching staff members</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Add Staff Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatsCards().map((stat, index) => (
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
            <h3 className="text-lg font-semibold text-gray-900">All Staff Members</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search staff..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <select 
                value={filters.department} 
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select 
                value={filters.status} 
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                {staffService.getStatusOptions().map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <DataTable
              data={staff}
              columns={columns}
              searchable={false} // We handle search ourselves
            />
          )}
        </div>
      </Card>

      {/* Staff Registration Modal */}
      <StaffRegistration
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        onSuccess={handleRegistrationSuccess}
        editingStaff={editingStaff}
      />

      {/* View Staff Modal */}
      {showViewModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <motion.div 
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Staff Details</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowViewModal(false)}
                >
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Full Name:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedStaff.fullName}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Staff ID:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedStaff.staffId}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedStaff.email}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Phone:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedStaff.phoneNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Gender:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedStaff.gender || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Date of Birth:</span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedStaff.dateOfBirth ? new Date(selectedStaff.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Nationality:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedStaff.nationality || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Employment Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Department:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedStaff.department}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Position:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedStaff.position}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        selectedStaff.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        selectedStaff.status === 'ON_LEAVE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {staffService.getStatusDisplay(selectedStaff.status)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Contract Type:</span>
                      <span className="ml-2 text-sm text-gray-900">
                        {staffService.getContractDisplay(selectedStaff.contractType)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Join Date:</span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedStaff.joinDate ? new Date(selectedStaff.joinDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Experience:</span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedStaff.experience ? `${selectedStaff.experience} years` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Qualification:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedStaff.qualification || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedStaff.address && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Address</h3>
                  <p className="text-sm text-gray-900">{selectedStaff.address}</p>
                </div>
              )}

              {(selectedStaff.emergencyContactName || selectedStaff.emergencyContactNumber) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contact</h3>
                  <div className="space-y-2">
                    {selectedStaff.emergencyContactName && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Name:</span>
                        <span className="ml-2 text-sm text-gray-900">{selectedStaff.emergencyContactName}</span>
                      </div>
                    )}
                    {selectedStaff.emergencyContactNumber && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Phone:</span>
                        <span className="ml-2 text-sm text-gray-900">{selectedStaff.emergencyContactNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <Button onClick={() => setShowViewModal(false)}>Close</Button>
                <Button onClick={() => {
                  setShowViewModal(false)
                  handleEdit(selectedStaff)
                }}>
                  Edit Staff
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Staff