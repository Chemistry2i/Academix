import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
  CameraIcon,
  DocumentIcon
} from '@heroicons/react/24/outline'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import { teacherService } from '../../services/teacherService'
import toast from 'react-hot-toast'

const TeacherRegistration = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingTeacher = null 
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
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
    maritalStatus: '',
    
    // Step 2: Professional Information
    teacherId: '',
    department: '',
    primarySubject: '',
    subjects: [],
    qualifications: '',
    yearsOfExperience: '',
    employmentType: 'PERMANENT',
    employmentStatus: 'ACTIVE',
    hireDate: '',
    salary: '',
    
    // Step 3: Additional Information
    emergencyContact: '',
    emergencyPhone: '',
    address: '',
    isClassTeacher: false,
    isDepartmentHead: false,
    profilePicture: null,
    documents: [] // CV, certificates, etc.
  })

  useEffect(() => {
    if (isOpen) {
      if (editingTeacher) {
        setFormData(editingTeacher)
        setCurrentStep(1)
      } else {
        generateTeacherId()
      }
    }
  }, [isOpen, editingTeacher])

  const generateTeacherId = async () => {
    try {
      // Try to get teacher ID from backend
      if (teacherService.generateTeacherId) {
        const response = await teacherService.generateTeacherId()
        if (response && response.teacherId) {
          setFormData(prev => ({ ...prev, teacherId: response.teacherId }))
          return
        }
      }
      // Generate a fallback ID if backend doesn't provide one
      const year = new Date().getFullYear()
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      setFormData(prev => ({ ...prev, teacherId: `TCH${year}${randomNum}` }))
    } catch (error) {
      console.error('Failed to generate teacher ID:', error)
      // Generate a fallback ID
      const year = new Date().getFullYear()
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      setFormData(prev => ({ ...prev, teacherId: `TCH${year}${randomNum}` }))
    }
  }

  const steps = [
    {
      number: 1,
      title: 'Personal Information',
      description: 'Basic personal details',
      icon: UserIcon
    },
    {
      number: 2,
      title: 'Professional Information',
      description: 'Teaching qualifications and role',
      icon: AcademicCapIcon
    },
    {
      number: 3,
      title: 'Additional Information',
      description: 'Emergency contacts and documents',
      icon: BriefcaseIcon
    }
  ]

  const departments = [
    'Mathematics',
    'English',
    'Science',
    'Social Studies',
    'Languages',
    'Arts',
    'Physical Education',
    'Special Needs',
    'Administration'
  ]

  const subjects = [
    'Mathematics',
    'English',
    'Physics',
    'Chemistry',
    'Biology',
    'Geography',
    'History',
    'Economics',
    'Literature',
    'Computer Science',
    'French',
    'Art',
    'Music',
    'Physical Education'
  ]

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateStep = (step) => {
    const errors = {}

    if (step === 1) {
      if (!formData.firstName.trim()) errors.firstName = 'First name is required'
      if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
      if (!formData.email.trim()) errors.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format'
      if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required'
      if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required'
      if (!formData.gender) errors.gender = 'Gender is required'
      if (!formData.nin.trim()) errors.nin = 'National ID is required'
    }

    if (step === 2) {
      if (!formData.department) errors.department = 'Department is required'
      if (!formData.primarySubject) errors.primarySubject = 'Primary subject is required'
      if (!formData.qualifications.trim()) errors.qualifications = 'Qualifications are required'
      if (!formData.employmentType) errors.employmentType = 'Employment type is required'
      if (!formData.hireDate) errors.hireDate = 'Hire date is required'
    }

    if (step === 3) {
      if (!formData.emergencyContact.trim()) errors.emergencyContact = 'Emergency contact name is required'
      if (!formData.emergencyPhone.trim()) errors.emergencyPhone = 'Emergency contact phone is required'
      if (!formData.address.trim()) errors.address = 'Address is required'
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
      // Prepare form data for submission
      const teacherData = {
        ...formData,
        password: formData.nin // Use NIN as temporary password
      }

      if (editingTeacher) {
        await teacherService.updateTeacher(editingTeacher.id, teacherData)
        toast.success('Teacher updated successfully!')
      } else {
        await teacherService.createTeacher(teacherData)
        toast.success('Teacher registered successfully!')
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to save teacher:', error)
      toast.error(editingTeacher ? 'Failed to update teacher' : 'Failed to register teacher')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileChange = (name, file) => {
    setFormData(prev => ({ ...prev, [name]: file }))
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter first name"
          />
          {formErrors.firstName && (
            <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter last name"
          />
          {formErrors.lastName && (
            <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Other Names
          </label>
          <input
            type="text"
            value={formData.otherNames}
            onChange={(e) => handleInputChange('otherNames', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Middle names or other names"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="teacher@school.edu"
          />
          {formErrors.email && (
            <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+256 700 000 000"
          />
          {formErrors.phoneNumber && (
            <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.dateOfBirth && (
            <p className="text-red-500 text-xs mt-1">{formErrors.dateOfBirth}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender *
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.gender ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {formErrors.gender && (
            <p className="text-red-500 text-xs mt-1">{formErrors.gender}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nationality
          </label>
          <input
            type="text"
            value={formData.nationality}
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            National ID Number *
          </label>
          <input
            type="text"
            value={formData.nin}
            onChange={(e) => handleInputChange('nin', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.nin ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="CM00000000000PN"
          />
          {formErrors.nin && (
            <p className="text-red-500 text-xs mt-1">{formErrors.nin}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marital Status
          </label>
          <select
            value={formData.maritalStatus}
            onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select marital status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teacher ID
          </label>
          <input
            type="text"
            value={formData.teacherId}
            disabled
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
            placeholder="Auto-generated"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department *
          </label>
          <select
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.department ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select department</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          {formErrors.department && (
            <p className="text-red-500 text-xs mt-1">{formErrors.department}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Subject *
          </label>
          <select
            value={formData.primarySubject}
            onChange={(e) => handleInputChange('primarySubject', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.primarySubject ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select primary subject</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          {formErrors.primarySubject && (
            <p className="text-red-500 text-xs mt-1">{formErrors.primarySubject}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience
          </label>
          <input
            type="number"
            value={formData.yearsOfExperience}
            onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="0"
            min="0"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qualifications *
          </label>
          <textarea
            value={formData.qualifications}
            onChange={(e) => handleInputChange('qualifications', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.qualifications ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Bachelor of Education (Mathematics), Diploma in Teaching..."
            rows="3"
          />
          {formErrors.qualifications && (
            <p className="text-red-500 text-xs mt-1">{formErrors.qualifications}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employment Type *
          </label>
          <select
            value={formData.employmentType}
            onChange={(e) => handleInputChange('employmentType', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.employmentType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select employment type</option>
            <option value="PERMANENT">Permanent</option>
            <option value="CONTRACT">Contract</option>
            <option value="PART_TIME">Part-time</option>
          </select>
          {formErrors.employmentType && (
            <p className="text-red-500 text-xs mt-1">{formErrors.employmentType}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hire Date *
          </label>
          <input
            type="date"
            value={formData.hireDate}
            onChange={(e) => handleInputChange('hireDate', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.hireDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.hireDate && (
            <p className="text-red-500 text-xs mt-1">{formErrors.hireDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Salary (Optional)
          </label>
          <input
            type="number"
            value={formData.salary}
            onChange={(e) => handleInputChange('salary', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="750000"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employment Status
          </label>
          <select
            value={formData.employmentStatus}
            onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isClassTeacher"
              checked={formData.isClassTeacher}
              onChange={(e) => handleInputChange('isClassTeacher', e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="isClassTeacher" className="ml-3 text-sm text-gray-700">
              Is Class Teacher
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDepartmentHead"
              checked={formData.isDepartmentHead}
              onChange={(e) => handleInputChange('isDepartmentHead', e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="isDepartmentHead" className="ml-3 text-sm text-gray-700">
              Is Department Head
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Contact Name *
          </label>
          <input
            type="text"
            value={formData.emergencyContact}
            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.emergencyContact ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Emergency contact name"
          />
          {formErrors.emergencyContact && (
            <p className="text-red-500 text-xs mt-1">{formErrors.emergencyContact}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Contact Phone *
          </label>
          <input
            type="tel"
            value={formData.emergencyPhone}
            onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.emergencyPhone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+256 700 000 000"
          />
          {formErrors.emergencyPhone && (
            <p className="text-red-500 text-xs mt-1">{formErrors.emergencyPhone}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address *
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Full residential address"
            rows="3"
          />
          {formErrors.address && (
            <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              {formData.profilePicture ? (
                <img 
                  src={URL.createObjectURL(formData.profilePicture)} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <CameraIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('profilePicture', e.target.files[0])}
                className="hidden"
                id="profilePicture"
              />
              <label
                htmlFor="profilePicture"
                className="inline-flex items-center px-4 py-2 border border-primary-300 text-primary-700 rounded-md cursor-pointer hover:bg-primary-50 transition-colors"
              >
                <CameraIcon className="w-4 h-4 mr-2" />
                Upload Photo
              </label>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG up to 5MB
              </p>
            </div>
          </div>
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
              {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStep} of {steps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="px-8 py-6 bg-gray-50">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex flex-col items-center ${index !== steps.length - 1 ? 'flex-1' : ''} min-w-0`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-medium text-sm mb-3 ${
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
                  <div className="text-center min-w-0 w-full">
                    <p className={`text-sm font-medium whitespace-nowrap ${
                      currentStep === step.number ? 'text-primary-600' : 'text-gray-600'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 whitespace-nowrap">{step.description}</p>
                  </div>
                </div>
                {index !== steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-6 mt-6 ${
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
                    <LoadingSpinner size={16} className="mr-2" />
                    {editingTeacher ? 'Updating...' : 'Registering...'}
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    {editingTeacher ? 'Update Teacher' : 'Register Teacher'}
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

export default TeacherRegistration