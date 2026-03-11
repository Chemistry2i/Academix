import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import { subjectService } from '../../services/subjectService'
import toast from 'react-hot-toast'

const SubjectRegistration = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingSubject = null 
}) => {
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    level: 'O_LEVEL',
    category: 'LANGUAGES',
    paperCount: 1,
    maxMarksPerPaper: 100,
    isCompulsory: false,
    isScience: false,
    isArts: false,
    isActive: true,
    syllabus: '',
    prerequisites: ''
  })

  const subjectLevels = [
    { value: 'O_LEVEL', label: 'O-Level (S1-S4)' },
    { value: 'A_LEVEL', label: 'A-Level (S5-S6)' },
    { value: 'BOTH', label: 'Both Levels' }
  ]

  const subjectCategories = [
    { value: 'LANGUAGES', label: 'Languages' },
    { value: 'MATHEMATICS', label: 'Mathematics' },
    { value: 'SCIENCES', label: 'Sciences' },
    { value: 'HUMANITIES', label: 'Humanities' },
    { value: 'RELIGIOUS_EDUCATION', label: 'Religious Education' },
    { value: 'TECHNICAL', label: 'Technical' },
    { value: 'VOCATIONAL', label: 'Vocational' },
    { value: 'CREATIVE_ARTS', label: 'Creative Arts' },
    { value: 'PHYSICAL_EDUCATION', label: 'Physical Education' }
  ]

  useEffect(() => {
    if (isOpen) {
      setFormErrors({})
      if (editingSubject) {
        setFormData({
          name: editingSubject.name || '',
          code: editingSubject.code || '',
          description: editingSubject.description || '',
          level: editingSubject.level || 'O_LEVEL',
          category: editingSubject.category || 'LANGUAGES',
          paperCount: editingSubject.paperCount || 1,
          maxMarksPerPaper: editingSubject.maxMarksPerPaper || 100,
          isCompulsory: editingSubject.isCompulsory || false,
          isScience: editingSubject.isScience || false,
          isArts: editingSubject.isArts || false,
          isActive: editingSubject.isActive !== false,
          syllabus: editingSubject.syllabus || '',
          prerequisites: editingSubject.prerequisites || ''
        })
      } else {
        setFormData({
          name: '',
          code: '',
          description: '',
          level: 'O_LEVEL',
          category: 'LANGUAGES',
          paperCount: 1,
          maxMarksPerPaper: 100,
          isCompulsory: false,
          isScience: false,
          isArts: false,
          isActive: true,
          syllabus: '',
          prerequisites: ''
        })
      }
    }
  }, [isOpen, editingSubject])

  const validateForm = () => {
    const errors = {}

    if (!formData.name?.trim()) {
      errors.name = 'Subject name is required'
    }

    if (!formData.code?.trim()) {
      errors.code = 'Subject code is required'
    } else if (!/^[A-Z_]+$/.test(formData.code)) {
      errors.code = 'Subject code must contain only uppercase letters and underscores'
    }

    if (!formData.category) {
      errors.category = 'Category is required'
    }

    if (!formData.level) {
      errors.level = 'Level is required'
    }

    if (!formData.paperCount || formData.paperCount < 1 || formData.paperCount > 10) {
      errors.paperCount = 'Paper count must be between 1 and 10'
    }

    if (!formData.maxMarksPerPaper || formData.maxMarksPerPaper < 1 || formData.maxMarksPerPaper > 500) {
      errors.maxMarksPerPaper = 'Max marks per paper must be between 1 and 500'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)

    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    try {
      setLoading(true)
      
      if (editingSubject) {
        await subjectService.updateSubject(editingSubject.id, formData)
        toast.success('Subject updated successfully!')
      } else {
        await subjectService.createSubject(formData)
        toast.success('Subject created successfully!')
      }
      
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to save subject:', error)
      
      // Handle specific error cases
      let message = 'Failed to save subject. Please try again.'
      
      if (error.response?.data?.error) {
        const errorData = error.response.data.error
        const errorMsg = typeof errorData === 'string' ? errorData.toLowerCase() : ''
        if (errorMsg.includes('unique') && errorMsg.includes('code')) {
          message = 'This subject code is already in use. Please choose a different code.'
        } else {
          message = typeof errorData === 'string' ? errorData : 'Failed to save subject. Please try again.'
        }
      } else if (error.message) {
        message = error.message
      }
      
      toast.error(message)
      
      // Handle specific backend validation errors
      if (error.response?.data?.validationErrors) {
        setFormErrors(error.response.data.validationErrors)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {editingSubject ? 'Update subject information' : 'Enter subject details below'}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Mathematics, Physics"
                  disabled={loading}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Code *
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.code ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., MATH, PHY"
                  disabled={loading}
                  style={{ textTransform: 'uppercase' }}
                />
                {formErrors.code && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>
                )}
              </div>
            </div>

            {/* Level and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                  Level *
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.level ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  {subjectLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                {formErrors.level && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.level}</p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  {subjectCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
                )}
              </div>
            </div>

            {/* Paper Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="paperCount" className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Papers *
                </label>
                <input
                  type="number"
                  id="paperCount"
                  name="paperCount"
                  value={formData.paperCount}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.paperCount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {formErrors.paperCount && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.paperCount}</p>
                )}
              </div>

              <div>
                <label htmlFor="maxMarksPerPaper" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Marks per Paper *
                </label>
                <input
                  type="number"
                  id="maxMarksPerPaper"
                  name="maxMarksPerPaper"
                  value={formData.maxMarksPerPaper}
                  onChange={handleInputChange}
                  min="1"
                  max="500"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.maxMarksPerPaper ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {formErrors.maxMarksPerPaper && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.maxMarksPerPaper}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the subject..."
                disabled={loading}
              />
            </div>

            {/* Prerequisites */}
            <div>
              <label htmlFor="prerequisites" className="block text-sm font-medium text-gray-700 mb-2">
                Prerequisites
              </label>
              <input
                type="text"
                id="prerequisites"
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., O-Level Mathematics, Basic Science"
                disabled={loading}
              />
            </div>

            {/* Flags */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Subject Properties</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isCompulsory"
                    name="isCompulsory"
                    checked={formData.isCompulsory}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="isCompulsory" className="ml-2 text-sm text-gray-700">
                    Compulsory Subject
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isScience"
                    name="isScience"
                    checked={formData.isScience}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="isScience" className="ml-2 text-sm text-gray-700">
                    Science Subject
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isArts"
                    name="isArts"
                    checked={formData.isArts}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="isArts" className="ml-2 text-sm text-gray-700">
                    Arts Subject
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active Subject
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {editingSubject ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    {editingSubject ? 'Update Subject' : 'Create Subject'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SubjectRegistration