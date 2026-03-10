import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  BookOpenIcon,
  ClockIcon,
  AcademicCapIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const Subjects = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [deletingSubject, setDeletingSubject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const [subjects, setSubjects] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    levelType: 'O_LEVEL',
    creditHours: 3,
    category: 'CORE',
    isActive: true,
    prerequisites: ''
  })

  const levelTypes = [
    { value: 'O_LEVEL', label: 'O-Level (S1-S4)' },
    { value: 'A_LEVEL', label: 'A-Level (S5-S6)' }
  ]

  const categories = [
    { value: 'CORE', label: 'Core Subject' },
    { value: 'ELECTIVE', label: 'Elective Subject' },
    { value: 'COMPULSORY', label: 'Compulsory Subject' },
    { value: 'OPTIONAL', label: 'Optional Subject' }
  ]

  // Load data on component mount
  useEffect(() => {
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    try {
      setLoading(true)
      // Mock data representing backend Subject model
      const mockSubjects = [
        {
          id: 1,
          name: 'Mathematics',
          code: 'MATH',
          description: 'Advanced mathematical concepts and problem solving',
          levelType: 'O_LEVEL',
          creditHours: 4,
          category: 'CORE',
          isActive: true,
          prerequisites: ''
        },
        {
          id: 2,
          name: 'English Literature',
          code: 'ENG_LIT',
          description: 'Study of English literature and language arts',
          levelType: 'O_LEVEL',
          creditHours: 3,
          category: 'CORE',
          isActive: true,
          prerequisites: 'Basic English'
        },
        {
          id: 3,
          name: 'Physics',
          code: 'PHY',
          description: 'Fundamental principles of physics and scientific inquiry',
          levelType: 'A_LEVEL',
          creditHours: 4,
          category: 'ELECTIVE',
          isActive: true,
          prerequisites: 'O-Level Mathematics'
        },
        {
          id: 4,
          name: 'Chemistry',
          code: 'CHEM',
          description: 'Chemical processes, reactions, and laboratory work',
          levelType: 'A_LEVEL',
          creditHours: 4,
          category: 'ELECTIVE',
          isActive: true,
          prerequisites: 'O-Level Mathematics, O-Level Science'
        },
        {
          id: 5,
          name: 'History',
          code: 'HIST',
          description: 'World history and historical analysis',
          levelType: 'O_LEVEL',
          creditHours: 3,
          category: 'COMPULSORY',
          isActive: true,
          prerequisites: ''
        },
        {
          id: 6,
          name: 'Biology',
          code: 'BIO',
          description: 'Life sciences and biological systems',
          levelType: 'A_LEVEL',
          creditHours: 4,
          category: 'ELECTIVE',
          isActive: true,
          prerequisites: 'O-Level Science'
        }
      ]
      setSubjects(mockSubjects)
      
      if (mockSubjects.length > 0) {
        toast.success(`Loaded ${mockSubjects.length} subjects successfully`)
      }
    } catch (error) {
      console.error('Failed to load subjects:', error)
      toast.error('Failed to load subjects')
      setSubjects([])
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.name?.trim()) {
      errors.name = 'Subject name is required'
    }
    
    if (!formData.code?.trim()) {
      errors.code = 'Subject code is required'
    }
    
    if (!formData.creditHours || formData.creditHours < 1) {
      errors.creditHours = 'Valid credit hours required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const columns = [
    { key: 'code', header: 'Code', sortable: true },
    { key: 'name', header: 'Subject Name', sortable: true },
    { 
      key: 'levelType', 
      header: 'Level', 
      sortable: true,
      render: (value) => value === 'O_LEVEL' ? 'O-Level' : 'A-Level'
    },
    { 
      key: 'category', 
      header: 'Category', 
      sortable: true,
      render: (value) => value.charAt(0) + value.slice(1).toLowerCase()
    },
    { key: 'creditHours', header: 'Credit Hours', sortable: true },
    { 
      key: 'prerequisites', 
      header: 'Prerequisites',
      render: (value) => value || 'None'
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
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(row)}
            className="hover:bg-blue-50 hover:border-blue-300"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
            onClick={() => handleDeleteClick(row)}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ]

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

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting')
      return
    }
    
    setSubmitting(true)
    const loadingToast = toast.loading(
      editingSubject ? 'Updating subject...' : 'Creating subject...'
    )

    try {
      const subjectData = {
        ...formData,
        creditHours: parseInt(formData.creditHours)
      }

      if (editingSubject) {
        // Update existing subject
        const updatedSubject = { ...editingSubject, ...subjectData }
        setSubjects(prev => prev.map(subject => 
          subject.id === editingSubject.id ? updatedSubject : subject
        ))
        toast.success(
          `Subject "${subjectData.name}" updated successfully!`,
          { id: loadingToast }
        )
      } else {
        // Create new subject
        const newSubject = {
          ...subjectData,
          id: Math.max(...subjects.map(s => s.id), 0) + 1
        }
        setSubjects(prev => [...prev, newSubject])
        toast.success(
          `Subject "${subjectData.name}" created successfully! ${subjectData.creditHours} credit hours.`,
          { id: loadingToast }
        )
      }

      resetForm()
    } catch (error) {
      console.error('Failed to save subject:', error)
      toast.error('Failed to save subject', { id: loadingToast })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (subjectData) => {
    setEditingSubject(subjectData)
    setFormData({
      name: subjectData.name || '',
      code: subjectData.code || '',
      description: subjectData.description || '',
      levelType: subjectData.levelType || 'O_LEVEL',
      creditHours: subjectData.creditHours || 3,
      category: subjectData.category || 'CORE',
      isActive: subjectData.isActive !== undefined ? subjectData.isActive : true,
      prerequisites: subjectData.prerequisites || ''
    })
    setIsCreateModalOpen(true)
  }

  const handleDeleteClick = (subjectData) => {
    setDeletingSubject(subjectData)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingSubject) return

    const loadingToast = toast.loading(`Deleting subject "${deletingSubject.name}"...`)
    
    try {
      setSubmitting(true)
      setSubjects(prev => prev.filter(subject => subject.id !== deletingSubject.id))
      toast.success(
        `Subject "${deletingSubject.name}" deleted successfully!`, 
        { id: loadingToast }
      )
      setIsDeleteModalOpen(false)
      setDeletingSubject(null)
    } catch (error) {
      console.error('Failed to delete subject:', error)
      toast.error('Failed to delete subject', { id: loadingToast })
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      levelType: 'O_LEVEL',
      creditHours: 3,
      category: 'CORE',
      isActive: true,
      prerequisites: ''
    })
    setFormErrors({})
    setIsCreateModalOpen(false)
    setEditingSubject(null)
  }

  // Calculate statistics
  const totalSubjects = subjects.length
  const oLevelSubjects = subjects.filter(s => s.levelType === 'O_LEVEL').length
  const aLevelSubjects = subjects.filter(s => s.levelType === 'A_LEVEL').length
  const activeSubjects = subjects.filter(s => s.isActive).length

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading subjects...</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Subject Management</h1>
            <p className="text-gray-600 mt-1">
              Manage academic subjects, credit hours, and course requirements
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary-600 hover:bg-primary-700"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Subject
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Subjects"
            value={totalSubjects}
            change="+3"
            changeType="positive"
            icon={CubeIcon}
            color="blue"
          />
          <StatCard
            title="O-Level Subjects"
            value={oLevelSubjects}
            change="+1"
            changeType="positive"
            icon={BookOpenIcon}
            color="green"
          />
          <StatCard
            title="A-Level Subjects"
            value={aLevelSubjects}
            change="+2"
            changeType="positive"
            icon={AcademicCapIcon}
            color="purple"
          />
          <StatCard
            title="Active Subjects"
            value={activeSubjects}
            change="0"
            changeType="neutral"
            icon={ClockIcon}
            color="yellow"
          />
        </div>

        {/* Subjects Table */}
        <Card>
          <DataTable
            data={subjects}
            columns={columns}
            searchable
            searchPlaceholder="Search subjects..."
          />
        </Card>

        {/* Create/Edit Modal */}
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
                  {editingSubject ? 'Edit Subject' : 'Create New Subject'}
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
                    <label className="block text-sm font-medium text-gray-700">Subject Name *</label>
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
                      placeholder="e.g., Mathematics"
                      required
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject Code *</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 ${
                        formErrors.code 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-primary-500'
                      }`}
                      placeholder="e.g., MATH"
                      required
                    />
                    {formErrors.code && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
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
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Credit Hours *</label>
                    <input
                      type="number"
                      name="creditHours"
                      value={formData.creditHours}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 ${
                        formErrors.creditHours 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-primary-500'
                      }`}
                      placeholder="3"
                      min="1"
                      max="8"
                      required
                    />
                    {formErrors.creditHours && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.creditHours}</p>
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
                    <label className="ml-2 block text-sm text-gray-900">Active Subject</label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Prerequisites</label>
                  <input
                    type="text"
                    name="prerequisites"
                    value={formData.prerequisites}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="e.g., O-Level Mathematics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Brief description of the subject..."
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
                        {editingSubject ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingSubject ? 'Update Subject' : 'Create Subject'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
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
                <h3 className="text-lg font-medium text-gray-900">Delete Subject</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{deletingSubject?.name}</strong>? 
                This action cannot be undone and may affect classes and students.
              </p>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setDeletingSubject(null)
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
                    'Delete Subject'
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Subjects