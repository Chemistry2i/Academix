import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckIcon, 
  XMarkIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  EyeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import Button from '../common/Button'
import Card from '../common/Card'
import LoadingSpinner from '../common/LoadingSpinner'
import departmentService from '../../services/departmentService'
import { teacherService } from '../../services/teacherService'

const DepartmentRegistration = ({ onClose, onSuccess, editDepartment = null }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [teachers, setTeachers] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const isEditing = !!editDepartment

  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    departmentCode: '',
    description: '',
    academicFocus: '',
    establishedYear: new Date().getFullYear(),
    status: 'ACTIVE',
    
    // Academic Vision
    visionStatement: '',
    missionStatement: '',
    targetEnrollment: '',
    minimumStaff: '',
    isCoreDepartment: true,
    
    // Location & Contact
    building: '',
    floor: '',
    officeRoom: '',
    phoneNumber: '',
    email: '',
    
    // Leadership
    departmentHeadId: ''
  })

  const steps = [
    {
      number: 1,
      title: 'Basic Information',
      description: 'Department details and academic focus',
      icon: BuildingOfficeIcon
    },
    {
      number: 2,
      title: 'Academic Vision',
      description: 'Vision, mission and targets',
      icon: DocumentTextIcon
    },
    {
      number: 3,
      title: 'Location & Contact',
      description: 'Physical location and contact details',
      icon: MapPinIcon
    },
    {
      number: 4,
      title: 'Leadership',
      description: 'Department head assignment',
      icon: UserGroupIcon
    },
    {
      number: 5,
      title: 'Review',
      description: 'Verify all information',
      icon: EyeIcon
    }
  ]

  // Load initial data
  useEffect(() => {
    loadTeachers()
    if (isEditing) {
      populateFormForEdit()
    }
  }, [])

  const loadTeachers = async () => {
    try {
      const response = await teacherService.getAllTeachers()
      if (response.success) {
        setTeachers(response.data.filter(teacher => teacher.employmentStatus === 'ACTIVE'))
      }
    } catch (error) {
      console.error('Error loading teachers:', error)
    }
  }

  const populateFormForEdit = () => {
    setFormData({
      name: editDepartment.name || '',
      departmentCode: editDepartment.departmentCode || '',
      description: editDepartment.description || '',
      academicFocus: editDepartment.academicFocus || '',
      establishedYear: editDepartment.establishedYear || new Date().getFullYear(),
      status: editDepartment.status || 'ACTIVE',
      visionStatement: editDepartment.visionStatement || '',
      missionStatement: editDepartment.missionStatement || '',
      targetEnrollment: editDepartment.targetEnrollment || '',
      minimumStaff: editDepartment.minimumStaff || '',
      isCoreDepartment: editDepartment.isCoreDepartment !== false,
      building: editDepartment.building || '',
      floor: editDepartment.floor || '',
      officeRoom: editDepartment.officeRoom || '',
      phoneNumber: editDepartment.phoneNumber || '',
      email: editDepartment.email || '',
      departmentHeadId: editDepartment.headTeacherId || ''
    })
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) return 'Department name is required'
        if (!formData.departmentCode.trim()) return 'Department code is required'
        if (!formData.establishedYear) return 'Establishment year is required'
        if (formData.establishedYear < 1950 || formData.establishedYear > new Date().getFullYear()) {
          return 'Please enter a valid establishment year'
        }
        break
      case 2:
        // Vision and mission are optional but recommended
        break
      case 3:
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          return 'Please enter a valid email address'
        }
        break
      case 4:
        // Department head is optional
        break
    }
    return null
  }

  const handleNext = () => {
    const error = validateStep(currentStep)
    if (error) {
      setError(error)
      return
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length))
    setError('')
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError('')
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Prepare the department data
      const departmentData = {
        name: formData.name.trim(),
        departmentCode: formData.departmentCode.trim().toUpperCase(),
        description: formData.description.trim(),
        academicFocus: formData.academicFocus.trim(),
        establishedYear: parseInt(formData.establishedYear),
        status: formData.status,
        visionStatement: formData.visionStatement.trim(),
        missionStatement: formData.missionStatement.trim(),
        targetEnrollment: formData.targetEnrollment ? parseInt(formData.targetEnrollment) : null,
        minimumStaff: formData.minimumStaff ? parseInt(formData.minimumStaff) : null,
        isCoreDepartment: formData.isCoreDepartment,
        building: formData.building.trim(),
        floor: formData.floor.trim(),
        officeRoom: formData.officeRoom.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim()
      }

      let response
      if (isEditing) {
        response = await departmentService.updateDepartment(editDepartment.id, departmentData)
      } else {
        response = await departmentService.createDepartment(departmentData)
      }

      if (response.success) {
        // If department head is selected, assign them
        if (formData.departmentHeadId) {
          try {
            await departmentService.setDepartmentHead(response.data.id, formData.departmentHeadId)
          } catch (headError) {
            console.warn('Department created but failed to set head:', headError)
          }
        }

        setSuccess(`Department ${isEditing ? 'updated' : 'created'} successfully!`)
        setTimeout(() => {
          onSuccess && onSuccess(response.data)
          onClose && onClose()
        }, 2000)
      }
    } catch (error) {
      console.error('Error saving department:', error)
      setError(error.message || `Failed to ${isEditing ? 'update' : 'create'} department`)
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g. Mathematics"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Code *
                </label>
                <input
                  type="text"
                  value={formData.departmentCode}
                  onChange={(e) => handleInputChange('departmentCode', e.target.value.toUpperCase())}
                  placeholder="e.g. MATH"
                  maxLength="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the department..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Focus
              </label>
              <input
                type="text"
                value={formData.academicFocus}
                onChange={(e) => handleInputChange('academicFocus', e.target.value)}
                placeholder="e.g. Pure Mathematics and Applied Sciences"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Establishment Year *
                </label>
                <input
                  type="number"
                  value={formData.establishedYear}
                  onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                  min="1950"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isCore"
                checked={formData.isCoreDepartment}
                onChange={(e) => handleInputChange('isCoreDepartment', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isCore" className="ml-2 text-sm text-gray-700">
                This is a core academic department
              </label>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vision Statement
              </label>
              <textarea
                value={formData.visionStatement}
                onChange={(e) => handleInputChange('visionStatement', e.target.value)}
                placeholder="What is the department's vision for the future?"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mission Statement
              </label>
              <textarea
                value={formData.missionStatement}
                onChange={(e) => handleInputChange('missionStatement', e.target.value)}
                placeholder="What is the department's core mission and purpose?"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Enrollment
                </label>
                <input
                  type="number"
                  value={formData.targetEnrollment}
                  onChange={(e) => handleInputChange('targetEnrollment', e.target.value)}
                  placeholder="Expected number of students"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Staff Required
                </label>
                <input
                  type="number"
                  value={formData.minimumStaff}
                  onChange={(e) => handleInputChange('minimumStaff', e.target.value)}
                  placeholder="Minimum teachers needed"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Building
                </label>
                <input
                  type="text"
                  value={formData.building}
                  onChange={(e) => handleInputChange('building', e.target.value)}
                  placeholder="e.g. Science Block"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor
                </label>
                <input
                  type="text"
                  value={formData.floor}
                  onChange={(e) => handleInputChange('floor', e.target.value)}
                  placeholder="e.g. 2nd Floor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Office Room
                </label>
                <input
                  type="text"
                  value={formData.officeRoom}
                  onChange={(e) => handleInputChange('officeRoom', e.target.value)}
                  placeholder="e.g. Room 201"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="e.g. +256 123 456 789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="department@school.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Head
              </label>
              <select
                value={formData.departmentHeadId}
                onChange={(e) => handleInputChange('departmentHeadId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a teacher as department head (Optional)</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.fullName} - {teacher.specialization || 'General'}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                You can assign a department head now or skip this step and assign one later.
              </p>
            </div>

            {formData.departmentHeadId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Selected Department Head</h4>
                {(() => {
                  const selectedTeacher = teachers.find(t => t.id === parseInt(formData.departmentHeadId))
                  return selectedTeacher ? (
                    <div className="text-sm text-blue-800">
                      <p><strong>{selectedTeacher.fullName}</strong></p>
                      <p>Specialization: {selectedTeacher.specialization || 'General'}</p>
                      <p>Experience: {selectedTeacher.yearsOfExperience || 0} years</p>
                      <p>Employment: {selectedTeacher.employmentType}</p>
                    </div>
                  ) : null
                })()}
              </div>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Basic Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {formData.name}</p>
                    <p><span className="font-medium">Code:</span> {formData.departmentCode}</p>
                    <p><span className="font-medium">Focus:</span> {formData.academicFocus || 'Not specified'}</p>
                    <p><span className="font-medium">Established:</span> {formData.establishedYear}</p>
                    <p><span className="font-medium">Status:</span> {formData.status}</p>
                    <p><span className="font-medium">Core Department:</span> {formData.isCoreDepartment ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Location & Contact</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Building:</span> {formData.building || 'Not specified'}</p>
                    <p><span className="font-medium">Floor:</span> {formData.floor || 'Not specified'}</p>
                    <p><span className="font-medium">Office:</span> {formData.officeRoom || 'Not specified'}</p>
                    <p><span className="font-medium">Phone:</span> {formData.phoneNumber || 'Not specified'}</p>
                    <p><span className="font-medium">Email:</span> {formData.email || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {formData.visionStatement && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Vision</h4>
                  <p className="text-sm text-gray-600">{formData.visionStatement}</p>
                </div>
              )}

              {formData.departmentHeadId && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Department Head</h4>
                  <p className="text-sm text-gray-600">
                    {teachers.find(t => t.id === parseInt(formData.departmentHeadId))?.fullName || 'Selected'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Department' : 'Create New Department'}
            </h2>
            <p className="text-gray-600">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.number
              const isCurrent = currentStep === step.number
              const Icon = step.icon
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-gray-200 border-gray-300 text-gray-500'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-16 h-1 mx-2 transition-colors
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                    `} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4"
            >
              <p className="text-red-700 text-sm">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4"
            >
              <p className="text-green-700 text-sm">{success}</p>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : handleBack}
            disabled={loading}
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>

          <div className="flex items-center gap-2">
            {currentStep < steps.length ? (
              <Button onClick={handleNext} disabled={loading}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  `${isEditing ? 'Update' : 'Create'} Department`
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default DepartmentRegistration