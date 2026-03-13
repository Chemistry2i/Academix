import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserIcon,
  BriefcaseIcon,
  PhoneIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import { staffService } from '../../services/staffService'
import departmentService from '../../services/departmentService'
import toast from 'react-hot-toast'

const StaffRegistration = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingStaff = null 
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [departments, setDepartments] = useState([])
  const [formErrors, setFormErrors] = useState({})

  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    firstName: '',
    lastName: '',
    otherNames: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Ugandan',
    nin: '',
    
    // Step 2: Employment Information
    department: '',
    position: '',
    status: 'ACTIVE',
    contractType: '',
    salary: '',
    qualification: '',
    experience: '',
    
    // Step 3: Contact & Emergency Details
    address: '',
    emergencyContactName: '',
    emergencyContactNumber: ''
  })

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1)
      setFormErrors({})
      setSubmitting(false)
      loadDepartments()
      
      if (editingStaff) {
        setFormData({
          ...editingStaff,
          department: editingStaff.department?.name || editingStaff.department || editingStaff.departmentName || '',
          dateOfBirth: editingStaff.dateOfBirth ? editingStaff.dateOfBirth.split('T')[0] : '',
          salary: editingStaff.salary?.toString() || '',
          experience: editingStaff.experience?.toString() || ''
        })
      } else {
        setFormData({
          firstName: '', lastName: '', otherNames: '', email: '', phoneNumber: '',
          dateOfBirth: '', gender: '', nationality: 'Ugandan', nin: '',
          department: '', position: '', status: 'ACTIVE', contractType: '',
          salary: '', qualification: '', experience: '',
          address: '', emergencyContactName: '', emergencyContactNumber: ''
        })
      }
    }
  }, [isOpen, editingStaff])

  const loadDepartments = async () => {
    try {
      setLoading(true)
      const departmentNames = await departmentService.getDepartmentNames({ activeOnly: true })
      setDepartments(departmentNames)
    } catch (error) {
      console.error('Failed to load departments:', error)
      setDepartments([])
      toast.error('Failed to load department options')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    {
      number: 1,
      title: 'Personal Info',
      icon: UserIcon,
      description: 'Basic personal information'
    },
    {
      number: 2,
      title: 'Employment',
      icon: BriefcaseIcon,
      description: 'Employment and qualifications'
    },
    {
      number: 3,
      title: 'Contact Details',
      icon: PhoneIcon,
      description: 'Address and emergency contact'
    }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateStep = (step) => {
    const errors = {}
    
    if (step === 1) {
      if (!formData.firstName.trim()) errors.firstName = 'First name is required'
      if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
      if (!formData.email.trim()) errors.email = 'Email is required'
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Invalid email format'
      }
      if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required'
      if (!formData.gender) errors.gender = 'Gender is required'
    }
    
    if (step === 2) {
      if (!formData.department.trim()) errors.department = 'Department is required'
      if (!formData.position.trim()) errors.position = 'Position is required'
    }

    // Step 3 has no required fields - all optional
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
    setFormErrors({})
  }

  const handleClose = () => {
    if (submitting) return
    onClose()
    setFormData({
      firstName: '', lastName: '', otherNames: '', email: '', phoneNumber: '',
      dateOfBirth: '', gender: '', nationality: 'Ugandan', nin: '',
      department: '', position: '', status: 'ACTIVE', contractType: '',
      salary: '', qualification: '', experience: '',
      address: '', emergencyContactName: '', emergencyContactNumber: ''
    })
    setCurrentStep(1)
    setFormErrors({})
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setSubmitting(true)
    const loadingToast = toast.loading(
      editingStaff ? 'Updating staff member...' : 'Registering staff member...'
    )

    try {
      // Prepare form data for submission
      const staffData = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        experience: formData.experience ? parseInt(formData.experience) : null
      }

      // Remove empty strings
      Object.keys(staffData).forEach(key => {
        if (staffData[key] === '') {
          staffData[key] = null
        }
      })

      let result
      if (editingStaff) {
        result = await staffService.updateStaff(editingStaff.id, staffData)
        toast.success(
          `Staff "${result.fullName || result.firstName + ' ' + result.lastName}" updated successfully!`,
          { id: loadingToast }
        )
      } else {
        result = await staffService.createStaff(staffData)
        toast.success(
          `Staff "${result.fullName || result.firstName + ' ' + result.lastName}" registered successfully! Staff ID: ${result.staffId}`,
          { id: loadingToast, duration: 6000 }
        )
      }

      onSuccess?.(result)
      onClose()
    } catch (error) {
      console.error('Failed to save staff:', error)
      
      let message = 'Failed to save staff member'
      if (error.response?.data?.message) {
        message = error.response.data.message
      } else if (error.response?.data?.error) {
        message = error.response.data.error
      }
      
      toast.error(message, { id: loadingToast })
    } finally {
      setSubmitting(false)
    }
  }

  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        <p className="text-gray-600">Enter the staff member's basic personal details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              formErrors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter first name"
          />
          {formErrors.firstName && (
            <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              formErrors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter last name"
          />
          {formErrors.lastName && (
            <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Other Names
          </label>
          <input
            type="text"
            name="otherNames"
            value={formData.otherNames}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter other names (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              formErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter email address"
          />
          {formErrors.email && (
            <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="+256 700 123 456"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              formErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.dateOfBirth && (
            <p className="text-red-500 text-sm mt-1">{formErrors.dateOfBirth}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender *
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              formErrors.gender ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          {formErrors.gender && (
            <p className="text-red-500 text-sm mt-1">{formErrors.gender}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nationality
          </label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter nationality"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            National ID Number (NIN)
          </label>
          <input
            type="text"
            name="nin"
            value={formData.nin}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter National ID Number (14 characters)"
            maxLength="14"
          />
        </div>
      </div>
    </div>
  )

  const renderEmploymentInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Employment Information</h3>
        <p className="text-gray-600">Enter employment details and qualifications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department *
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            disabled={loading}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              formErrors.department ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">
              {loading ? 'Loading departments...' : departments.length ? 'Select department' : 'No departments available'}
            </option>
            {(formData.department && !departments.includes(formData.department)
              ? [formData.department, ...departments]
              : departments
            ).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          {formErrors.department && (
            <p className="text-red-500 text-sm mt-1">{formErrors.department}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position *
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              formErrors.position ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter position/job title"
          />
          {formErrors.position && (
            <p className="text-red-500 text-sm mt-1">{formErrors.position}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employment Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {staffService.getStatusOptions().map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contract Type
          </label>
          <select
            name="contractType"
            value={formData.contractType}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select contract type</option>
            {staffService.getContractTypeOptions().map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Salary (UGX)
          </label>
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter monthly salary"
            min="0"
            step="1000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience
          </label>
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Years of work experience"
            min="0"
            max="50"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qualification
          </label>
          <input
            type="text"
            name="qualification"
            value={formData.qualification}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter highest qualification (e.g., Bachelor of Arts, Diploma in...)"
          />
        </div>
      </div>
    </div>
  )

  const renderContactDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Contact & Emergency Details</h3>
        <p className="text-gray-600">Enter address and emergency contact information</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows="3"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter complete address (district, town/village, etc.)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact Name
            </label>
            <input
              type="text"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter emergency contact name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact Number
            </label>
            <input
              type="tel"
              name="emergencyContactNumber"
              value={formData.emergencyContactNumber}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="+256 700 123 456"
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Registration Summary
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Staff Member: <strong>{formData.firstName} {formData.lastName}</strong></p>
                <p>Position: <strong>{formData.position}</strong> in <strong>{formData.department}</strong></p>
                <p>Email: <strong>{formData.email}</strong></p>
                <p className="mt-2 text-xs">
                  {editingStaff ? 'Update' : 'Registration'} credentials will be sent to the email address above.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfoStep()
      case 2:
        return renderEmploymentInfoStep()
      case 3:
        return renderContactDetailsStep()
      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {editingStaff ? 'Edit Staff Member' : 'Staff Registration'}
              </h2>
              <p className="text-primary-100 mt-1">
                {editingStaff ? 'Update staff member information' : 'Register a new staff member in the system'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-primary-200 transition-colors"
              disabled={submitting}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center py-6 bg-gray-50 border-b">
          <div className="flex items-center space-x-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number
              const isAccessible = currentStep >= step.number
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                      ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : isActive 
                          ? 'bg-primary-600 border-primary-600 text-white' 
                          : isAccessible
                          ? 'border-gray-300 text-gray-500'
                          : 'border-gray-200 text-gray-300'
                      }
                    `}>
                      {isCompleted ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${ 
                        isActive ? 'text-primary-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-24 h-0.5 mx-4 ${ 
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer with Navigation */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between">
          <div>
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex items-center gap-2"
                disabled={submitting}
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            
            {currentStep < 3 && (
              <Button
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRightIcon className="w-4 h-4" />
              </Button>
            )}
            
            {currentStep === 3 && (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2"
              >
                {submitting && <LoadingSpinner size="sm" />}
                {editingStaff ? 'Update Staff Member' : 'Register Staff Member'}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default StaffRegistration