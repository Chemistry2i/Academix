import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpenIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import { courseService } from '../../services/courseService'
import toast from 'react-hot-toast'

const CourseRegistration = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingCourse = null 
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    code: '',
    name: '',
    type: '',
    level: '',
    description: '',
    
    // Step 2: Subjects
    principalSubjects: [],
    subsidiarySubjects: [],
    
    // Step 3: Additional Details
    requirements: '',
    careerPaths: '',
    maxStudents: 0,
    isActive: true
  })

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1)
      setFormErrors({})
      setSubmitting(false)
      if (editingCourse) {
        setFormData({
          ...editingCourse,
          principalSubjects: editingCourse.principalSubjects || [],
          subsidiarySubjects: editingCourse.subsidiarySubjects || []
        })
        setCurrentStep(1)
      } else {
        setFormData({
          code: '',
          name: '',
          type: '',
          level: '',
          description: '',
          principalSubjects: [],
          subsidiarySubjects: [],
          requirements: '',
          careerPaths: '',
          maxStudents: 0,
          isActive: true
        })
      }
    }
  }, [isOpen, editingCourse])

  const steps = [
    {
      number: 1,
      title: 'Basic Information',
      description: 'Course code, name and type',
      icon: BookOpenIcon
    },
    {
      number: 2,
      title: 'Subjects',
      description: 'Principal and subsidiary subjects',
      icon: AcademicCapIcon
    },
    {
      number: 3,
      title: 'Additional Details',
      description: 'Requirements and career paths',
      icon: DocumentTextIcon
    }
  ]

  const courseTypes = [
    'SCIENCES',
    'ARTS', 
    'TECHNICAL',
    'MIXED'
  ]

  const courseLevels = [
    'O_LEVEL',
    'A_LEVEL'
  ]

  const courseNameOptions = [
    'Physics, Chemistry, Mathematics',
    'Physics, Chemistry, Biology',
    'History, Economics, Geography',
    'History, Economics, Literature',
    'Mathematics, Economics, Geography',
    'Biology, Chemistry, Agriculture',
    'Literature, Divinity, History',
    'Art, Literature, History',
    'Computer Science, Mathematics, Physics',
    'Entrepreneurship, Economics, Geography'
  ]

  const availableSubjects = [
    'Mathematics',
    'Physics',
    'Chemistry', 
    'Biology',
    'History',
    'Geography',
    'Economics',
    'Literature',
    'English',
    'Kiswahili',
    'French',
    'Computer Science',
    'Art',
    'Music',
    'Physical Education',
    'General Paper',
    'Divinity',
    'Entrepreneurship',
    'Agriculture'
  ]

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const addPrincipalSubject = () => {
    setFormData(prev => ({
      ...prev,
      principalSubjects: [...prev.principalSubjects, '']
    }))
  }

  const removePrincipalSubject = (index) => {
    setFormData(prev => ({
      ...prev,
      principalSubjects: prev.principalSubjects.filter((_, i) => i !== index)
    }))
  }

  const updatePrincipalSubject = (index, value) => {
    setFormData(prev => ({
      ...prev,
      principalSubjects: prev.principalSubjects.map((subject, i) => 
        i === index ? value : subject
      )
    }))
  }

  const addSubsidiarySubject = () => {
    setFormData(prev => ({
      ...prev,
      subsidiarySubjects: [...prev.subsidiarySubjects, '']
    }))
  }

  const removeSubsidiarySubject = (index) => {
    setFormData(prev => ({
      ...prev,
      subsidiarySubjects: prev.subsidiarySubjects.filter((_, i) => i !== index)
    }))
  }

  const updateSubsidiarySubject = (index, value) => {
    setFormData(prev => ({
      ...prev,
      subsidiarySubjects: prev.subsidiarySubjects.map((subject, i) => 
        i === index ? value : subject
      )
    }))
  }

  const validateStep = (step) => {
    const errors = {}

    if (step === 1) {
      if (!formData.code.trim()) errors.code = 'Course code is required'
      if (!formData.name.trim()) errors.name = 'Course name is required'
      if (!formData.type) errors.type = 'Course type is required'
      if (!formData.level) errors.level = 'Course level is required'
    }

    if (step === 2) {
      if (formData.principalSubjects.length === 0) {
        errors.principalSubjects = 'At least one principal subject is required'
      } else {
        const emptySubjects = formData.principalSubjects.some(s => !s.trim())
        if (emptySubjects) {
          errors.principalSubjects = 'All principal subjects must be selected'
        }
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return
    }

    setSubmitting(true)
    try {
      // Filter out empty subjects
      const courseData = {
        ...formData,
        principalSubjects: formData.principalSubjects.filter(s => s.trim()),
        subsidiarySubjects: formData.subsidiarySubjects.filter(s => s.trim()),
        maxStudents: parseInt(formData.maxStudents) || 0
      }

      if (editingCourse) {
        await courseService.updateCourse(editingCourse.id, courseData)
        toast.success('Course updated successfully!')
      } else {
        await courseService.createCourse(courseData)
        toast.success('Course created successfully!')
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to save course:', error)
      
      // Handle specific error cases
      let message = editingCourse ? 'Failed to update course' : 'Failed to create course'
      
      if (error.response?.data?.error) {
        const errorData = error.response.data.error
        const errorMsg = typeof errorData === 'string' ? errorData.toLowerCase() : ''
        if (errorMsg.includes('unique') && errorMsg.includes('code')) {
          message = 'This course code is already in use. Please choose a different code.'
        } else {
          message = typeof errorData === 'string' ? errorData : (editingCourse ? 'Failed to update course' : 'Failed to create course')
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
      setSubmitting(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Code *
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.code ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., PCM, PCB, HEG"
            maxLength="10"
          />
          {formErrors.code && (
            <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Level *
          </label>
          <select
            value={formData.level}
            onChange={(e) => handleInputChange('level', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.level ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select level</option>
            {courseLevels.map(level => (
              <option key={level} value={level}>
                {level.replace('_', '-')}
              </option>
            ))}
          </select>
          {formErrors.level && (
            <p className="text-red-500 text-xs mt-1">{formErrors.level}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Name *
          </label>
          <select
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select course combination</option>
            {courseNameOptions.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
            {formData.name && !courseNameOptions.includes(formData.name) && (
              <option value={formData.name}>{formData.name}</option>
            )}
          </select>
          {formErrors.name && (
            <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.type ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select type</option>
            {courseTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {formErrors.type && (
            <p className="text-red-500 text-xs mt-1">{formErrors.type}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Students (0 = unlimited)
          </label>
          <input
            type="number"
            value={formData.maxStudents}
            onChange={(e) => handleInputChange('maxStudents', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="0"
            min="0"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Brief description of this course combination..."
            rows="3"
          />
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="ml-3 text-sm text-gray-700">
              Course is active
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Principal Subjects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Principal Subjects *
            </label>
            <button
              type="button"
              onClick={addPrincipalSubject}
              className="flex items-center text-sm text-primary-600 hover:text-primary-700"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Subject
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.principalSubjects.map((subject, index) => (
              <div key={index} className="flex items-center space-x-2">
                <select
                  value={subject}
                  onChange={(e) => updatePrincipalSubject(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select subject</option>
                  {availableSubjects.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removePrincipalSubject(index)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {formData.principalSubjects.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <AcademicCapIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No principal subjects added</p>
            </div>
          )}
          
          {formErrors.principalSubjects && (
            <p className="text-red-500 text-xs mt-1">{formErrors.principalSubjects}</p>
          )}
        </div>

        {/* Subsidiary Subjects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Subsidiary Subjects
            </label>
            <button
              type="button"
              onClick={addSubsidiarySubject}
              className="flex items-center text-sm text-primary-600 hover:text-primary-700"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Subject
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.subsidiarySubjects.map((subject, index) => (
              <div key={index} className="flex items-center space-x-2">
                <select
                  value={subject}
                  onChange={(e) => updateSubsidiarySubject(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select subject</option>
                  {availableSubjects.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeSubsidiarySubject(index)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {formData.subsidiarySubjects.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <BookOpenIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No subsidiary subjects added</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entry Requirements
          </label>
          <textarea
            value={formData.requirements}
            onChange={(e) => handleInputChange('requirements', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., Credit in Physics, Mathematics at O-Level..."
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Career Paths
          </label>
          <textarea
            value={formData.careerPaths}
            onChange={(e) => handleInputChange('careerPaths', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., Engineering, Medicine, Architecture..."
            rows="3"
          />
        </div>
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStep} of {steps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="px-8 py-6 bg-gray-50">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center ${index !== steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-medium text-sm ${
                    currentStep === step.number
                      ? 'bg-primary-600 text-white'
                      : currentStep > step.number
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="ml-4 min-w-0">
                    <p className={`text-sm font-medium ${
                      currentStep === step.number ? 'text-primary-600' : 'text-gray-600'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 whitespace-nowrap">{step.description}</p>
                  </div>
                </div>
                {index !== steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-6 ${
                    currentStep > step.number ? 'bg-green-300' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-96 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={submitting}
                className="flex items-center"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex space-x-3">
            {currentStep < 3 && (
              <Button
                onClick={nextStep}
                disabled={submitting}
                className="flex items-center"
              >
                Next
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            )}
            
            {currentStep === 3 && (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {editingCourse ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    {editingCourse ? 'Update Course' : 'Create Course'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CourseRegistration