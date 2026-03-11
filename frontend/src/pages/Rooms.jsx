import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  UsersIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { roomService } from '../services/roomService'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

const Rooms = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [viewingRoom, setViewingRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [filters, setFilters] = useState({
    roomType: '',
    building: '',
    availableOnly: false
  })

  const [formData, setFormData] = useState({
    roomNumber: '',
    roomName: '',
    roomType: 'CLASSROOM',
    capacity: '',
    location: '',
    building: '',
    floor: '',
    equipment: '',
    isAvailable: true,
    notes: ''
  })

  const roomTypes = [
    { value: 'CLASSROOM', label: 'Classroom' },
    { value: 'LABORATORY', label: 'Laboratory' },
    { value: 'LIBRARY', label: 'Library' },
    { value: 'HALL', label: 'Hall/Auditorium' },
    { value: 'OFFICE', label: 'Office' },
    { value: 'SPORTS', label: 'Sports Facility' }
  ]

  const commonBuildings = [
    'Main Building',
    'Science Building',
    'ICT Building',
    'Library Building',
    'Students Building',
    'Sports Complex',
    'Administration Block'
  ]

  useEffect(() => {
    loadRooms()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [rooms, filters])

  const loadRooms = async () => {
    try {
      setLoading(true)
      const data = await roomService.getAllRooms()
      setRooms(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load rooms:', error)
      toast.error('Failed to load rooms')
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = rooms

    if (filters.roomType) {
      filtered = filtered.filter(room => room.roomType === filters.roomType)
    }

    if (filters.building) {
      filtered = filtered.filter(room => room.building === filters.building)
    }

    if (filters.availableOnly) {
      filtered = filtered.filter(room => room.isAvailable)
    }

    setFilteredRooms(filtered)
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.roomNumber?.trim()) {
      errors.roomNumber = 'Room number is required'
    }

    if (!formData.roomType) {
      errors.roomType = 'Room type is required'
    }

    if (formData.capacity && (isNaN(formData.capacity) || parseInt(formData.capacity) < 1)) {
      errors.capacity = 'Capacity must be a positive number'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setFormData({
      roomNumber: '',
      roomName: '',
      roomType: 'CLASSROOM',
      capacity: '',
      location: '',
      building: '',
      floor: '',
      equipment: '',
      isAvailable: true,
      notes: ''
    })
    setFormErrors({})
    setEditingRoom(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    try {
      setSubmitting(true)
      
      const roomData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      }

      if (editingRoom) {
        await roomService.updateRoom(editingRoom.id, roomData)
        toast.success('Room updated successfully!')
      } else {
        await roomService.createRoom(roomData)
        toast.success('Room created successfully!')
      }

      setIsCreateModalOpen(false)
      resetForm()
      loadRooms()
    } catch (error) {
      console.error('Failed to save room:', error)
      toast.error(error?.error || 'Failed to save room')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (room) => {
    setFormData({
      roomNumber: room.roomNumber || '',
      roomName: room.roomName || '',
      roomType: room.roomType || 'CLASSROOM',
      capacity: room.capacity?.toString() || '',
      location: room.location || '',
      building: room.building || '',
      floor: room.floor || '',
      equipment: room.equipment || '',
      isAvailable: room.isAvailable !== false,
      notes: room.notes || ''
    })
    setEditingRoom(room)
    setIsCreateModalOpen(true)
  }

  const handleDelete = async (room) => {
    const result = await Swal.fire({
      title: 'Delete Room',
      text: `Are you sure you want to delete room "${room.roomNumber}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        await roomService.deleteRoom(room.id)
        toast.success('Room deleted successfully!')
        loadRooms()
      } catch (error) {
        console.error('Failed to delete room:', error)
        toast.error('Failed to delete room')
      }
    }
  }

  const handleView = (room) => {
    setViewingRoom(room)
    setIsViewModalOpen(true)
  }

  const columns = [
    {
      key: 'roomNumber',
      header: 'Room Number',
      render: (value, room) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{room.roomName}</div>
        </div>
      )
    },
    {
      key: 'roomType',
      header: 'Type',
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value === 'CLASSROOM' ? 'bg-blue-100 text-blue-800' :
          value === 'LABORATORY' ? 'bg-purple-100 text-purple-800' :
          value === 'LIBRARY' ? 'bg-green-100 text-green-800' :
          value === 'HALL' ? 'bg-orange-100 text-orange-800' :
          value === 'OFFICE' ? 'bg-gray-100 text-gray-800' :
          value === 'SPORTS' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {roomTypes.find(type => type.value === value)?.label || value}
        </span>
      )
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (value) => (
        <div className="flex items-center">
          <UsersIcon className="w-4 h-4 mr-1 text-gray-400" />
          {value || 'Not specified'}
        </div>
      )
    },
    {
      key: 'building',
      header: 'Building & Location',
      render: (value, room) => (
        <div>
          <div className="font-medium text-gray-900">{value || 'Not specified'}</div>
          {room.floor && <div className="text-sm text-gray-500">{room.floor}</div>}
          {room.location && <div className="text-sm text-gray-500">{room.location}</div>}
        </div>
      )
    },
    {
      key: 'isAvailable',
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Available' : 'Unavailable'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, room) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleView(room)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(room)}
            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
            title="Edit Room"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(room)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete Room"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  // Statistics
  const stats = {
    totalRooms: rooms.length,
    availableRooms: rooms.filter(r => r.isAvailable).length,
    totalCapacity: rooms.reduce((sum, room) => sum + (room.capacity || 0), 0),
    roomTypes: [...new Set(rooms.map(r => r.roomType))].length
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600 mt-1">Manage classrooms, labs, and facilities</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Room
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Type
              </label>
              <select
                value={filters.roomType}
                onChange={(e) => setFilters(prev => ({ ...prev, roomType: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {roomTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Building
              </label>
              <select
                value={filters.building}
                onChange={(e) => setFilters(prev => ({ ...prev, building: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Buildings</option>
                {[...new Set(rooms.map(r => r.building).filter(Boolean))].map((building) => (
                  <option key={building} value={building}>
                    {building}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, availableOnly: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Available Only</span>
              </label>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => setFilters({ roomType: '', building: '', availableOnly: false })}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Rooms"
          value={stats.totalRooms}
          icon={BuildingStorefrontIcon}
          color="blue"
        />
        <StatCard
          title="Available"
          value={stats.availableRooms}
          icon={CheckIcon}
          color="green"
        />
        <StatCard
          title="Total Capacity"
          value={stats.totalCapacity}
          icon={UsersIcon}
          color="purple"
        />
        <StatCard
          title="Room Types"
          value={stats.roomTypes}
          icon={CubeIcon}
          color="orange"
        />
      </div>

      {/* Rooms Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
          <span className="ml-3 text-gray-600">Loading rooms...</span>
        </div>
      ) : filteredRooms.length > 0 ? (
        <DataTable
          data={filteredRooms}
          columns={columns}
          searchable
          sortable
          pagination
          pageSize={15}
        />
      ) : (
        <Card>
          <div className="p-12 text-center">
            <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No rooms found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {rooms.length === 0 ? 'No rooms have been created yet.' : 'No rooms match your current filters.'}
            </p>
            <div className="mt-6">
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center mx-auto"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Room
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => !submitting && setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingRoom ? 'Edit Room' : 'Add New Room'}
                </h2>
                <button
                  onClick={() => !submitting && setIsCreateModalOpen(false)}
                  disabled={submitting}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.roomNumber ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., S1A, PHYS101"
                      disabled={submitting}
                    />
                    {formErrors.roomNumber && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.roomNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Name
                    </label>
                    <input
                      type="text"
                      value={formData.roomName}
                      onChange={(e) => setFormData(prev => ({ ...prev, roomName: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Physics Laboratory 1"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.roomType}
                      onChange={(e) => setFormData(prev => ({ ...prev, roomType: e.target.value }))}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.roomType ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={submitting}
                    >
                      {roomTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.roomType && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.roomType}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.capacity ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 50"
                      min="1"
                      disabled={submitting}
                    />
                    {formErrors.capacity && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.capacity}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Building
                    </label>
                    <select
                      value={formData.building}
                      onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={submitting}
                    >
                      <option value="">Select Building</option>
                      {commonBuildings.map((building) => (
                        <option key={building} value={building}>
                          {building}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Floor
                    </label>
                    <input
                      type="text"
                      value={formData.floor}
                      onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Ground Floor, 1st Floor"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location/Description
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Near main entrance"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment & Facilities
                  </label>
                  <textarea
                    value={formData.equipment}
                    onChange={(e) => setFormData(prev => ({ ...prev, equipment: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Projector, Whiteboard, Lab equipment"
                    rows="2"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes or comments"
                    rows="2"
                    disabled={submitting}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                    className="mr-2"
                    disabled={submitting}
                  />
                  <label htmlFor="isAvailable" className="text-sm text-gray-700">
                    Room is available for use
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    {submitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        {editingRoom ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4 mr-2" />
                        {editingRoom ? 'Update Room' : 'Create Room'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {isViewModalOpen && viewingRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsViewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Room Details: {viewingRoom.roomNumber}
                </h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Room Number</span>
                    <p className="text-gray-900 mt-1">{viewingRoom.roomNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Room Name</span>
                    <p className="text-gray-900 mt-1">{viewingRoom.roomName || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type</span>
                    <p className="text-gray-900 mt-1">
                      {roomTypes.find(type => type.value === viewingRoom.roomType)?.label || viewingRoom.roomType}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Capacity</span>
                    <p className="text-gray-900 mt-1">{viewingRoom.capacity || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Building</span>
                    <p className="text-gray-900 mt-1">{viewingRoom.building || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Floor</span>
                    <p className="text-gray-900 mt-1">{viewingRoom.floor || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      viewingRoom.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {viewingRoom.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>

                {viewingRoom.location && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Location</span>
                    <p className="text-gray-900 mt-1">{viewingRoom.location}</p>
                  </div>
                )}

                {viewingRoom.equipment && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Equipment & Facilities</span>
                    <p className="text-gray-900 mt-1">{viewingRoom.equipment}</p>
                  </div>
                )}

                {viewingRoom.notes && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Notes</span>
                    <p className="text-gray-900 mt-1">{viewingRoom.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false)
                    handleEdit(viewingRoom)
                  }}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit Room
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Rooms