import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UsersIcon, 
  PlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  MapPinIcon,
  UserIcon
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
      <AnimatePresence>
        {showViewModal && selectedStaff && (
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
                      {selectedStaff.fullName?.[0] || ''}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedStaff.fullName}</h2>
                      <p className="text-primary-200 text-sm mt-0.5">{selectedStaff.staffId || 'No ID'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedStaff.status === 'ACTIVE'
                            ? 'bg-green-400/20 text-green-100 ring-1 ring-green-300/40'
                            : selectedStaff.status === 'ON_LEAVE'
                            ? 'bg-yellow-400/20 text-yellow-100 ring-1 ring-yellow-300/40'
                            : 'bg-red-400/20 text-red-100 ring-1 ring-red-300/40'
                        }`}>
                          {staffService.getStatusDisplay(selectedStaff.status)}
                        </span>
                        {selectedStaff.gender && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                            {selectedStaff.gender}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowViewModal(false)}
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
                    <p className="font-medium">{selectedStaff.department || '—'}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Position</span>
                    <p className="font-medium">{selectedStaff.position || '—'}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Contract</span>
                    <p className="font-medium">{staffService.getContractDisplay(selectedStaff.contractType) || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
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
                        ['Full Name', selectedStaff.fullName],
                        ['Staff ID', selectedStaff.staffId],
                        ['Date of Birth', selectedStaff.dateOfBirth ? new Date(selectedStaff.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : null],
                        ['Gender', selectedStaff.gender],
                        ['Nationality', selectedStaff.nationality],
                      ].filter(([, v]) => v != null && v !== '').map(([label, val], i) => (
                        <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-500 font-medium w-44">{label}</td>
                          <td className="px-4 py-2 text-gray-900">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Employment Information */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-sky-50 border-b border-gray-200">
                    <span className="w-5 h-5 rounded bg-sky-600 flex items-center justify-center">
                      <BriefcaseIcon className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="text-sm font-semibold text-sky-800">Employment Information</h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Department', selectedStaff.department],
                        ['Position', selectedStaff.position],
                        ['Status', staffService.getStatusDisplay(selectedStaff.status)],
                        ['Contract Type', staffService.getContractDisplay(selectedStaff.contractType)],
                        ['Join Date', selectedStaff.joinDate ? new Date(selectedStaff.joinDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : null],
                        ['Experience', selectedStaff.experience ? `${selectedStaff.experience} years` : null],
                        ['Qualification', selectedStaff.qualification],
                      ].filter(([, v]) => v != null && v !== '').map(([label, val], i) => (
                        <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-500 font-medium w-44">{label}</td>
                          <td className="px-4 py-2 text-gray-900">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Contact */}
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
                        ['Email', selectedStaff.email],
                        ['Phone', selectedStaff.phoneNumber],
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
                {selectedStaff.address && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-gray-200">
                      <span className="w-5 h-5 rounded bg-amber-600 flex items-center justify-center">
                        <MapPinIcon className="w-3 h-3 text-white" />
                      </span>
                      <h3 className="text-sm font-semibold text-amber-800">Address</h3>
                    </div>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="bg-white">
                          <td className="px-4 py-2 text-gray-500 font-medium w-44">Address</td>
                          <td className="px-4 py-2 text-gray-900">{selectedStaff.address}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Emergency Contact */}
                {(selectedStaff.emergencyContactName || selectedStaff.emergencyContactNumber) && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 border-b border-gray-200">
                      <span className="w-5 h-5 rounded bg-purple-600 flex items-center justify-center">
                        <PhoneIcon className="w-3 h-3 text-white" />
                      </span>
                      <h3 className="text-sm font-semibold text-purple-800">Emergency Contact</h3>
                    </div>
                    <table className="w-full text-sm">
                      <tbody>
                        {[
                          ['Name', selectedStaff.emergencyContactName],
                          ['Phone', selectedStaff.emergencyContactNumber],
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
                  {selectedStaff.joinDate
                    ? `Joined: ${new Date(selectedStaff.joinDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
                    : ''}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowViewModal(false); handleEdit(selectedStaff) }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-yellow-300 rounded-lg text-yellow-700 hover:bg-yellow-50 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
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

export default Staff