import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  MapPinIcon,
  ClockIcon,
  AcademicCapIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { NotificationModal, BulkActionModal } from '../components/common/NotificationModal'
import { classService } from '../services/classService'
import { teacherService } from '../services/teacherService'
import toast from 'react-hot-toast'

const Classes = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [deletingClass, setDeletingClass] = useState(null)
  const [selectedClasses, setSelectedClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [courses, setCourses] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    formLevel: '',
    stream: '',
    levelType: 'O_LEVEL',
    classTeacher: null,
    assistantClassTeacher: null,
    academicYear: '2026',
    maxCapacity: 50,
    classroom: '',
    building: '',
    notes: '',
    isActive: true
  })

  const levels = [1, 2, 3, 4, 5, 6]
  const streams = ['A', 'B', 'C', 'D', 'E', 'East', 'West', 'PCM', 'PCB', 'HEG', 'MEG'] 
  const levelTypes = [
    { value: 'O_LEVEL', label: 'O-Level (S1-S4)' },
    { value: 'A_LEVEL', label: 'A-Level (S5-S6)' }
  ]

  // Load data on component mount
  useEffect(() => {
    console.log('Classes component mounted')
    
    // Check backend connectivity first
    const checkBackend = async () => {
      try {
        const response = await fetch('/api/classes', { method: 'HEAD' })
        console.log('Backend connectivity check - Status:', response.status)
        if (!response.ok) {
          toast.error('Backend server may not be running. Please start the Spring Boot server.')
          return
        }
      } catch (error) {
        console.error('Backend connectivity check failed:', error)
        toast.error('Cannot connect to backend server. Please ensure Spring Boot server is running on port 8080.')
        return
      }
    }
    
    checkBackend()
    loadClasses()
    loadTeachers()
  }, [])

  const loadClasses = async () => {
    try {
      setLoading(true)
      console.log('Loading classes...')
      const data = await classService.getClasses()
      console.log('Classes loaded:', data)
      console.log('Is array?', Array.isArray(data))
      console.log('Length:', data?.length)
      setClasses(Array.isArray(data) ? data : [])
      
      if ((Array.isArray(data) ? data : []).length === 0) {
        toast('No classes found. Create your first class!', {
          icon: '📚',
          duration: 4000,
        })
      }
    } catch (error) {
      console.error('Failed to load classes:', error)
      toast.error('Failed to load classes. Please check your connection.')
      // Set empty array to show empty state
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  const loadTeachers = async () => {
    try {
      console.log('🔄 Loading teachers...')
      const teachersData = await teacherService.getTeachers()
      console.log('📡 Teachers API Response:', teachersData)
      
      // Extract teachers array from the response object
      const teachersArray = teachersData?.teachers || teachersData || []
      console.log('👥 Extracted teachers array:', teachersArray)
      
      setTeachers(Array.isArray(teachersArray) ? teachersArray : [])
      
      if (teachersArray.length === 0) {
        console.log('⚠️ No teachers found in database')
        toast('No teachers found. Please create teachers first!', {
          icon: '👨‍🏫',
          duration: 4000,
        })
      } else {
        console.log(`✅ Successfully loaded ${teachersArray.length} teachers`)
      }
    } catch (error) {
      console.error('❌ Failed to load teachers:', error)
      // Keep teachers as empty array - no more fallback mock data
      setTeachers([])
      toast.error('Failed to load teachers from server')
    }
  }

  const columns = [
    { key: 'name', header: 'Class Name', sortable: true },
    { 
      key: 'formLevel', 
      header: 'Form Level', 
      sortable: true,
      render: (value) => `S${value}`
    },
    { key: 'stream', header: 'Stream', sortable: true },
    { 
      key: 'levelType', 
      header: 'Level Type', 
      sortable: true,
      render: (value) => value === 'O_LEVEL' ? 'O-Level' : 'A-Level'
    },
    { 
      key: 'classTeacher', 
      header: 'Class Teacher', 
      sortable: true,
      render: (value) => value ? `${value.firstName} ${value.lastName}` : 'Not assigned'
    },
    { key: 'classroom', header: 'Room', sortable: true },
    { key: 'building', header: 'Building', sortable: true },
    { 
      key: 'currentCount', 
      header: 'Students', 
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <span className="font-medium">{value || 0}</span>
          <span className="text-gray-500">/{row.maxCapacity || 50}</span>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div 
              className={`h-1 rounded-full ${
                ((value || 0)/(row.maxCapacity || 50)) > 0.9 ? 'bg-red-500' :
                ((value || 0)/(row.maxCapacity || 50)) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{width: `${((value || 0)/(row.maxCapacity || 50)) * 100}%`}}
            ></div>
          </div>
        </div>
      )
    },
    { 
      key: 'isActive', 
      header: 'Status', 
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(row)}
            className="inline-flex items-center gap-1 text-yellow-600 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300"
          >
            <PencilIcon className="w-4 h-4" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="inline-flex items-center gap-1 text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
            onClick={() => handleDeleteClick(row)}
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </Button>
        </div>
      )
    }
  ]

  const validateForm = () => {
    const errors = {}
    
    if (!formData.name?.trim()) {
      errors.name = 'Class name is required'
    }
    
    if (!formData.formLevel) {
      errors.formLevel = 'Form level is required'
    }
    
    if (!formData.stream?.trim()) {
      errors.stream = 'Stream is required'
    }
    
    if (!formData.maxCapacity || formData.maxCapacity < 1) {
      errors.maxCapacity = 'Valid capacity is required'
    }
    
    if (!formData.academicYear?.trim()) {
      errors.academicYear = 'Academic year is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const refreshData = async () => {
    setRefreshing(true)
    const loadingToast = toast.loading('Refreshing class data...')
    
    try {
      await loadClasses()
      toast.success('Class data refreshed successfully!', { id: loadingToast })
    } catch (error) {
      toast.error('Failed to refresh data', { id: loadingToast })
    } finally {
      setRefreshing(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const finalValue = type === 'checkbox' ? checked : value

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    setFormData(prev => {
      const newFormData = { ...prev, [name]: finalValue }
      
      // Auto-generate class name when form level and stream are selected
      if ((name === 'formLevel' || name === 'stream') && newFormData.formLevel && newFormData.stream) {
        newFormData.name = `S${newFormData.formLevel}${newFormData.stream}`
      }
      
      // Auto-set level type based on form level
      if (name === 'formLevel') {
        const level = parseInt(value)
        if (level >= 1 && level <= 4) {
          newFormData.levelType = 'O_LEVEL'
        } else if (level >= 5 && level <= 6) {
          newFormData.levelType = 'A_LEVEL'
        }
      }

      // Set teacher relationship object
      if (name === 'classTeacherId') {
        const teacher = teachers.find(t => t.id === parseInt(value))
        newFormData.classTeacher = teacher || null
      }

      return newFormData
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting')
      return
    }
    
    setSubmitting(true)
    const loadingToast = toast.loading(
      editingClass ? 'Updating class...' : 'Creating class...'
    )

    try {
      // Prepare data for backend
      const classData = {
        ...formData,
        formLevel: parseInt(formData.formLevel),
        maxCapacity: parseInt(formData.maxCapacity),
        classTeacher: formData.classTeacher?.id ? { id: formData.classTeacher.id } : null
      }

      console.log('Submitting class data:', classData)
      console.log('Original form data:', formData)
      console.log('Teacher assignment:', {
        hasTeacher: !!formData.classTeacher,
        teacherId: formData.classTeacher?.id,
        teacherName: formData.classTeacher ? `${formData.classTeacher.firstName} ${formData.classTeacher.lastName}` : 'None',
        submittingAs: classData.classTeacher
      })

      let result
      if (editingClass) {
        result = await classService.updateClass(editingClass.id, classData)
        toast.success(
          `Class "${result.name || classData.name}" updated successfully!`,
          { id: loadingToast }
        )
      } else {
        result = await classService.createClass(classData)
        console.log('Class creation result:', result)
        toast.success(
          `Class "${result.name || classData.name}" created successfully! ${result.maxCapacity} student capacity.`,
          { id: loadingToast }
        )
      }

      console.log('About to reload classes after creation/update...')
      await loadClasses() // Reload classes
      console.log('Classes reloaded after creation/update')
      resetForm()
    } catch (error) {
      console.error('Failed to save class:', error)
      
      // Handle specific teacher assignment errors
      let message = error.response?.data?.error || error.message || 'Failed to save class'
      
      if (message.includes('Teacher not found')) {
        message = 'The selected teacher could not be found. Please refresh the page and try again.'
      } else if (message.includes('already exists')) {
        message = 'A class with this name already exists for this academic year.'
      } else if (message.includes('Invalid response format')) {
        message = 'Server error during teacher assignment. Please try again.'
      }
      
      toast.error(message, { id: loadingToast })
      
      // Handle specific backend validation errors
      if (error.response?.data?.validationErrors) {
        setFormErrors(error.response.data.validationErrors)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (classData) => {
    setEditingClass(classData)
    setFormData({
      name: classData.name || '',
      formLevel: classData.formLevel?.toString() || '',
      stream: classData.stream || '',
      levelType: classData.levelType || 'O_LEVEL',
      classTeacher: classData.classTeacher || null,
      assistantClassTeacher: classData.assistantClassTeacher || null,
      academicYear: classData.academicYear || '2026',
      maxCapacity: classData.maxCapacity || 50,
      classroom: classData.classroom || '',
      building: classData.building || '',
      notes: classData.notes || '',
      isActive: classData.isActive !== undefined ? classData.isActive : true
    })
    setIsCreateModalOpen(true)
  }

  const handleDeleteClick = (classData) => {
    setDeletingClass(classData)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingClass) return

    const loadingToast = toast.loading(`Deleting class "${deletingClass.name}"...`)
    
    try {
      setSubmitting(true)
      await classService.deleteClass(deletingClass.id)
      toast.success(
        `Class "${deletingClass.name}" deleted successfully!`, 
        { id: loadingToast }
      )
      await loadClasses() // Reload classes
      setIsDeleteModalOpen(false)
      setDeletingClass(null)
    } catch (error) {
      console.error('Failed to delete class:', error)
      const message = error.response?.data?.error || error.message || 'Failed to delete class'
      toast.error(message, { id: loadingToast })
    } finally {
      setSubmitting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedClasses.length === 0) return

    const loadingToast = toast.loading(`Deleting ${selectedClasses.length} classes...`)
    
    try {
      setSubmitting(true)
      
      // Delete classes one by one
      const deletePromises = selectedClasses.map(classId => 
        classService.deleteClass(classId)
      )
      
      await Promise.all(deletePromises)
      
      toast.success(
        `Successfully deleted ${selectedClasses.length} classes!`,
        { id: loadingToast }
      )
      
      setSelectedClasses([])
      setIsBulkDeleteModalOpen(false)
      await loadClasses() // Reload classes
    } catch (error) {
      console.error('Failed to delete classes:', error)
      toast.error('Failed to delete some classes', { id: loadingToast })
    } finally {
      setSubmitting(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedClasses.length === classes.length) {
      setSelectedClasses([])
    } else {
      setSelectedClasses(classes.map(cls => cls.id))
    }
  }

  const toggleSelectClass = (classId) => {
    setSelectedClasses(prev => 
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    )
  }

  const resetForm = () => {
    setFormData({
      name: '',
      formLevel: '',
      stream: '',
      levelType: 'O_LEVEL',
      classTeacher: null,
      assistantClassTeacher: null,
      academicYear: '2026',
      maxCapacity: 50,
      classroom: '',
      building: '',
      notes: '',
      isActive: true
    })
    setFormErrors({})
    setIsCreateModalOpen(false)
    setEditingClass(null)
  }

  // Calculate statistics
  const totalClasses = classes.length
  const totalStudents = classes.reduce((sum, cls) => sum + (cls.currentCount || 0), 0)
  const totalCapacity = classes.reduce((sum, cls) => sum + (cls.maxCapacity || 50), 0)
  const avgUtilization = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0

  // Debug logging
  console.log('Classes render - current classes:', classes)
  console.log('Classes render - classes length:', classes?.length)
  console.log('Classes render - classes type:', typeof classes, Array.isArray(classes))
  console.log('Classes render - loading state:', loading)

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading classes...</span>
      </div>
    )
  }

  // Show empty state when no classes
  if (!loading && classes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
            <p className="text-gray-600 mt-1">
              Create and manage school classes, assign teachers and track capacity
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary-600 hover:bg-primary-700"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create First Class
            </Button>
          </div>
        </div>
        
        <Card>
          <div className="text-center py-12">
            <AcademicCapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Found</h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first class. You can organize students by form level, stream, and academic year.
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary-600 hover:bg-primary-700"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Class
            </Button>
          </div>
        </Card>
        
        {/* Create/Edit Modal for Empty State */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Create Your First Class
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Form Level *</label>
                      <select
                        name="formLevel"
                        value={formData.formLevel}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 ${
                          formErrors.formLevel 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-primary-500'
                        }`}
                        required
                      >
                        <option value="">Select Form Level</option>
                        {levels.map(level => (
                          <option key={level} value={level}>S{level}</option>
                        ))}
                      </select>
                      {formErrors.formLevel && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.formLevel}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stream *</label>
                      <select
                        name="stream"
                        value={formData.stream}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 ${
                          formErrors.stream 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-primary-500'
                        }`}
                        required
                      >
                        <option value="">Select Stream</option>
                        {streams.map(stream => (
                          <option key={stream} value={stream}>{stream}</option>
                        ))}
                      </select>
                      {formErrors.stream && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.stream}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Class Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 ${
                          formErrors.name 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-primary-500'
                        }`}
                        placeholder="e.g., S6A"
                        required
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Maximum Capacity *</label>
                      <input
                        type="number"
                        name="maxCapacity"
                        value={formData.maxCapacity}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 ${
                          formErrors.maxCapacity 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-primary-500'
                        }`}
                        placeholder="50"
                        min="1"
                        max="100"
                        required
                      />
                      {formErrors.maxCapacity && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.maxCapacity}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-primary-600 hover:bg-primary-700"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Creating...
                        </>
                      ) : (
                        'Create Class'
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
            <p className="text-gray-600 mt-1">
              Create and manage school classes, assign teachers and track capacity
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button
              variant="outline"
              onClick={refreshData}
              disabled={refreshing}
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              {refreshing ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <ClockIcon className="w-4 h-4 mr-2" />
              )}
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary-600 hover:bg-primary-700"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Class
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Classes"
            value={totalClasses}
            change="+2"
            changeType="positive"
            icon={AcademicCapIcon}
            color="blue"
          />
          <StatCard
            title="Total Students"
            value={totalStudents.toLocaleString()}
            change="+15"
            changeType="positive"
            icon={UserGroupIcon}
            color="green"
          />
          <StatCard
            title="Total Capacity"
            value={totalCapacity.toLocaleString()}
            change="+5"
            changeType="positive"
            icon={MapPinIcon}
            color="purple"
          />
          <StatCard
            title="Avg Utilization"
            value={`${avgUtilization}%`}
            change="+3%"
            changeType="positive"
            icon={ClockIcon}
            color="yellow"
          />
        </div>

        {/* Classes Table */}
        <Card>
          <DataTable
            data={classes}
            columns={columns}
            searchable
            searchPlaceholder="Search classes..."
          />
        </Card>

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingClass ? 'Edit Class' : 'Create New Class'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Form Level *</label>
                      <select
                        name="formLevel"
                        value={formData.formLevel}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 ${
                          formErrors.formLevel 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-primary-500'
                        }`}
                        required
                      >
                        <option value="">Select Form Level</option>
                        {levels.map(level => (
                          <option key={level} value={level}>S{level}</option>
                        ))}
                      </select>
                      {formErrors.formLevel && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.formLevel}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stream *</label>
                      <select
                        name="stream"
                        value={formData.stream}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 ${
                          formErrors.stream 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-primary-500'
                        }`}
                        required
                      >
                        <option value="">Select Stream</option>
                        {streams.map(stream => (
                          <option key={stream} value={stream}>{stream}</option>
                        ))}
                      </select>
                      {formErrors.stream && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.stream}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Level Type</label>
                      <select
                        name="levelType"
                        value={formData.levelType}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        {levelTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Class Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 ${
                          formErrors.name 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-primary-500'
                        }`}
                        placeholder="e.g., S6A"
                        required
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Class Teacher</label>
                      <select
                        name="classTeacherId"
                        value={formData.classTeacher?.id || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="">Select Teacher</option>
                        {Array.isArray(teachers) && teachers.length > 0 ? (
                          teachers.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.firstName && teacher.lastName 
                                ? `${teacher.firstName} ${teacher.lastName}` 
                                : teacher.fullName || `Teacher ${teacher.id}`} 
                              {teacher.department ? ` (${teacher.department})` : ''}
                            </option>
                          ))
                        ) : (
                          <option disabled>No teachers available - Create teachers first</option>
                        )}
                      </select>
                      {teachers.length === 0 && (
                        <p className="mt-1 text-sm text-yellow-600">
                          ⚠️ No teachers found. Please go to Teachers page and create teachers first.
                        </p>
                      )}
                      {process.env.NODE_ENV === 'development' && (
                        <p className="mt-1 text-xs text-gray-500">
                          Debug: {teachers.length} teachers loaded
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Classroom</label>
                      <input
                        type="text"
                        name="classroom"
                        value={formData.classroom}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="e.g., Room 101"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Building</label>
                      <input
                        type="text"
                        name="building"
                        value={formData.building}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="e.g., Science Block"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Maximum Capacity *</label>
                      <input
                        type="number"
                        name="maxCapacity"
                        value={formData.maxCapacity}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 ${
                          formErrors.maxCapacity 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-primary-500'
                        }`}
                        placeholder="50"
                        min="1"
                        max="100"
                        required
                      />
                      {formErrors.maxCapacity && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.maxCapacity}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Academic Year *</label>
                      <input
                        type="text"
                        name="academicYear"
                        value={formData.academicYear}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 ${
                          formErrors.academicYear 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-primary-500'
                        }`}
                        placeholder="2026"
                        required
                      />
                      {formErrors.academicYear && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.academicYear}</p>
                      )}
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">Active Class</label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Additional notes about this class..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-primary-600 hover:bg-primary-700"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          {editingClass ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        editingClass ? 'Update Class' : 'Create Class'
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl p-6 w-full max-w-md"
              >
                <div className="flex items-center mb-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">Delete Class</h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <strong>{deletingClass?.name}</strong>? 
                  This action cannot be undone and will affect all associated students and records.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDeleteModalOpen(false)
                      setDeletingClass(null)
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleDeleteConfirm}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Class'
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default Classes

