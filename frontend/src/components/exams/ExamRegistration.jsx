import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import { examService } from '../../services/examService'
import { classService } from '../../services/classService'
import toast from 'react-hot-toast'

const ExamRegistration = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingExam = null 
}) => {
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [allClasses, setAllClasses] = useState([])
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'BOT',
    level: 'O_LEVEL',
    academicYear: '2025/2026',
    term: 1,
    startDate: '',
    endDate: '',
    targetClasses: [],
    marksEntryDeadline: '',
    description: '',
    instructions: ''
  })

  const examTypes = [
    { value: 'BOT', label: 'Beginning of Term (BOT)' },
    { value: 'MOT', label: 'Mid of Term (MOT)' },
    { value: 'EOT', label: 'End of Term (EOT)' },
    { value: 'UCE', label: 'Uganda Certificate of Education (UCE)' },
    { value: 'UACE', label: 'Uganda Advanced Certificate of Education (UACE)' },
    { value: 'MOCK', label: 'Mock Exam' },
    { value: 'QUIZ', label: 'Quiz' }
  ]

  const examLevels = [
    { value: 'O_LEVEL', label: 'O-Level (S1-S4)' },
    { value: 'A_LEVEL', label: 'A-Level (S5-S6)' }
  ]

  const academicYears = [
    '2025/2026',
    '2024/2025',
    '2023/2024'
  ]

  const FALLBACK_CLASSES = [
    'S1A','S1B','S1C',
    'S2A','S2B','S2C',
    'S3A','S3B','S3C',
    'S4A','S4B','S4C',
    'S5 PCM','S5 PCB','S5 HEG','S5 BCM',
    'S6 PCM','S6 PCB','S6 HEG','S6 BCM'
  ]

  // Load classes from the database, fall back to defaults if empty or error
  useEffect(() => {
    classService.getClasses()
      .then(data => {
        const names = (Array.isArray(data) ? data : [])
          .map(c => c.className || c.name || c)
          .filter(Boolean)
        setAllClasses(names.length > 0 ? names : FALLBACK_CLASSES)
      })
      .catch(() => {
        setAllClasses(FALLBACK_CLASSES)
      })
  }, [])

  useEffect(() => {
    if (isOpen) {
      setFormErrors({})
      if (editingExam) {
        setFormData({
          code: editingExam.code || '',
          name: editingExam.name || '',
          type: editingExam.type || 'BOT',
          level: editingExam.level || 'O_LEVEL', 
          academicYear: editingExam.academicYear || '2025/2026',
          term: editingExam.term || 1,
          startDate: editingExam.startDate || '',
          endDate: editingExam.endDate || '',
          targetClasses: editingExam.targetClasses || [],
          marksEntryDeadline: editingExam.marksEntryDeadline ? 
            new Date(editingExam.marksEntryDeadline).toISOString().slice(0, 16) : '',
          description: editingExam.description || '',
          instructions: editingExam.instructions || ''
        })
      } else {
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]
        setFormData({
          code: '',
          name: '',
          type: 'BOT',
          level: 'O_LEVEL',
          academicYear: '2025/2026',
          term: 1,
          startDate: todayStr,
          endDate: todayStr,
          targetClasses: [],
          marksEntryDeadline: '',
          description: '',
          instructions: ''
        })
      }
    }
  }, [isOpen, editingExam])

  const validateForm = () => {
    const errors = {}

    if (!formData.code?.trim()) {
      errors.code = 'Exam code is required'
    }

    if (!formData.name?.trim()) {
      errors.name = 'Exam name is required'
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required'
    }

    if (!formData.endDate) {
      errors.endDate = 'End date is required'
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      errors.endDate = 'End date must be after start date'
    }

    if (formData.targetClasses.length === 0) {
      errors.targetClasses = 'At least one target class is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  const handleClassToggle = (className) => {
    setFormData(prev => ({
      ...prev,
      targetClasses: prev.targetClasses.includes(className)
        ? prev.targetClasses.filter(c => c !== className)
        : [...prev.targetClasses, className]
    }))

    if (formErrors.targetClasses) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.targetClasses
        return newErrors
      })
    }
  }

  const selectAllClasses = () => {
    const filteredClasses = formData.level === 'O_LEVEL' 
      ? allClasses.filter(c => c.startsWith('S1') || c.startsWith('S2') || c.startsWith('S3') || c.startsWith('S4'))
      : allClasses.filter(c => c.startsWith('S5') || c.startsWith('S6'))
    
    setFormData(prev => ({
      ...prev,
      targetClasses: filteredClasses
    }))
  }

  const clearAllClasses = () => {
    setFormData(prev => ({
      ...prev,
      targetClasses: []
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
      
      const submitData = {
        ...formData,
        marksEntryDeadline: formData.marksEntryDeadline ? new Date(formData.marksEntryDeadline).toISOString() : null
      }
      
      if (editingExam) {
        await examService.updateExam(editingExam.id, submitData)
        toast.success('Exam updated successfully!')
      } else {
        await examService.createExam(submitData)
        toast.success('Exam scheduled successfully!')
      }
      
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to save exam:', error)
      
      // Handle specific error cases
      let message = 'Failed to save exam. Please try again.'
      
      if (error.response?.data?.error) {
        const errorData = error.response.data.error
        const errorMsg = typeof errorData === 'string' ? errorData.toLowerCase() : ''
        if (errorMsg.includes('unique') && errorMsg.includes('code')) {
          message = 'This exam code is already in use. Please choose a different code.'
        } else {
          message = typeof errorData === 'string' ? errorData : 'Failed to save exam. Please try again.'
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

  const filteredClasses = formData.level === 'O_LEVEL' 
    ? allClasses.filter(c => c.startsWith('S1') || c.startsWith('S2') || c.startsWith('S3') || c.startsWith('S4'))
    : allClasses.filter(c => c.startsWith('S5') || c.startsWith('S6'))

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
          className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editingExam ? 'Edit Examination' : 'Schedule New Examination'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {editingExam ? 'Update examination details' : 'Enter examination details below'}
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
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Code *
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.code ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., BOT1-2026-S1"
                  disabled={loading}
                />
                {formErrors.code && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>
                )}
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Beginning of Term 1 Examinations"
                  disabled={loading}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>
            </div>

            {/* Type and Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={loading}
                >
                  {examTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                  Level *
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={loading}
                >
                  {examLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Academic Year and Term */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year *
                </label>
                <select
                  id="academicYear"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={loading}
                >
                  {academicYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-2">
                  Term *
                </label>
                <select
                  id="term"
                  name="term"
                  value={formData.term}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={loading}
                >
                  <option value={1}>Term 1</option>
                  <option value={2}>Term 2</option>
                  <option value={3}>Term 3</option>
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.startDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {formErrors.startDate && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.startDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.endDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {formErrors.endDate && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.endDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="marksEntryDeadline" className="block text-sm font-medium text-gray-700 mb-2">
                  Marks Entry Deadline
                </label>
                <input
                  type="datetime-local"
                  id="marksEntryDeadline"
                  name="marksEntryDeadline"
                  value={formData.marksEntryDeadline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Target Classes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Target Classes * 
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={selectAllClasses}
                    className="text-xs text-blue-600 hover:text-blue-800"
                    disabled={loading}
                  >
                    Select All
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    type="button"
                    onClick={clearAllClasses}
                    className="text-xs text-red-600 hover:text-red-800"
                    disabled={loading}
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className={`border rounded-lg p-3 ${formErrors.targetClasses ? 'border-red-300' : 'border-gray-300'}`}>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {filteredClasses.map((className) => (
                    <label key={className} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.targetClasses.includes(className)}
                        onChange={() => handleClassToggle(className)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        disabled={loading}
                      />
                      <span className="ml-2 text-sm text-gray-700">{className}</span>
                    </label>
                  ))}
                </div>
              </div>
              {formErrors.targetClasses && (
                <p className="text-red-500 text-xs mt-1">{formErrors.targetClasses}</p>
              )}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Brief description of the examination..."
                disabled={loading}
              />
            </div>

            {/* Instructions */}
            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Special instructions for the examination..."
                disabled={loading}
              />
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
                    {editingExam ? 'Updating...' : 'Scheduling...'}
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    {editingExam ? 'Update Exam' : 'Schedule Exam'}
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

export default ExamRegistration