import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserIcon,
  AcademicCapIcon,
  MapPinIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
  CameraIcon,
  DocumentIcon
} from '@heroicons/react/24/outline'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import { studentService } from '../../services/studentService'
import { classService } from '../../services/classService'
import toast from 'react-hot-toast'

const StudentRegistration = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingStudent = null 
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [classes, setClasses] = useState([])
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
    disabilityStatus: '',
    
    // Step 2: Academic Information
    currentClass: '',
    stream: '',
    house: '',
    residenceStatus: 'DAY',
    combination: '',
    studentId: '',
    linn: '',
    
    // Step 3: Address & Documents
    district: '',
    county: '',
    subCounty: '',
    parish: '',
    village: '',
    profilePicture: null,
    birthCertificate: null
  })

  useEffect(() => {
    if (isOpen) {
      loadClasses()
      if (editingStudent) {
        setFormData(editingStudent)
        setCurrentStep(1)
      } else {
        generateStudentId()
      }
    }
  }, [isOpen, editingStudent])

  const loadClasses = async () => {
    try {
      const data = await classService.getClasses()
      setClasses(data)
    } catch (error) {
      console.error('Failed to load classes:', error)
      toast.error('Failed to load class options')
    }
  }

  const generateStudentId = async () => {
    try {
      const response = await studentService.generateStudentId()
      setFormData(prev => ({ ...prev, studentId: response.studentId }))
    } catch (error) {
      console.error('Failed to generate student ID:', error)
      // Generate a fallback ID
      const year = new Date().getFullYear()
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      setFormData(prev => ({ ...prev, studentId: `STU${year}${randomNum}` }))
    }
  }

  const steps = [
    {
      number: 1,
      title: 'Personal Information',
      icon: UserIcon,
      description: 'Basic personal details'
    },
    {
      number: 2,
      title: 'Academic Details',
      icon: AcademicCapIcon,
      description: 'Class and academic information'
    },
    {
      number: 3,
      title: 'Address & Documents',
      icon: MapPinIcon,
      description: 'Location and document uploads'
    }
  ]

  const ugandanDistricts = [
    'Kampala', 'Wakiso', 'Mukono', 'Jinja', 'Mbale', 'Gulu', 'Lira', 'Mbarara',
    'Masaka', 'Fort Portal', 'Arua', 'Kasese', 'Kabale', 'Soroti', 'Hoima'
  ]

  const houses = [
    'Red House', 'Blue House', 'Green House', 'Yellow House',
    'Eagle House', 'Lion House', 'Tiger House', 'Leopard House'
  ]

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    
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

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB')
        return
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPG, PNG, and PDF files are allowed')
        return
      }
      
      setFormData(prev => ({ ...prev, [fileType]: file }))
    }
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
      if (formData.nin && !/^[A-Z0-9]{14}$/.test(formData.nin)) {
        errors.nin = 'NIN must be 14 alphanumeric characters'
      }
    }
    
    if (step === 2) {
      if (!formData.currentClass) errors.currentClass = 'Class is required'
      if (!formData.stream) errors.stream = 'Stream is required'
      if (!formData.residenceStatus) errors.residenceStatus = 'Residence status is required'
      if (formData.residenceStatus === 'BOARDING' && !formData.house) {
        errors.house = 'House is required for boarding students'
      }
    }
    
    if (step === 3) {
      if (!formData.district) errors.district = 'District is required'
      if (!formData.county) errors.county = 'County is required'
      if (!formData.subCounty) errors.subCounty = 'Sub-county is required'
      if (!formData.parish) errors.parish = 'Parish is required'
      if (!formData.village) errors.village = 'Village is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1)
      }
    } else {
      toast.error('Please fill in all required fields')
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    const loadingToast = toast.loading(
      editingStudent ? 'Updating student...' : 'Registering student...'
    )

    try {
      const studentData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth,
        schoolClass: formData.currentClass ? { id: parseInt(formData.currentClass) } : null
      }

      let result
      if (editingStudent) {
        result = await studentService.updateStudent(editingStudent.id, studentData)
        toast.success(
          `Student "${result.firstName} ${result.lastName}" updated successfully!`,
          { id: loadingToast }
        )
      } else {
        result = await studentService.createStudent(studentData)
        toast.success(
          `Student "${result.firstName} ${result.lastName}" registered successfully! Student ID: ${result.studentId}`,
          { id: loadingToast, duration: 6000 }
        )
      }

      // Handle file uploads if any
      if (formData.profilePicture && result.id) {
        try {
          await studentService.uploadProfilePicture(result.id, formData.profilePicture)
          toast.success('Profile picture uploaded successfully')
        } catch (error) {
          toast.error('Failed to upload profile picture')
        }
      }

      if (formData.birthCertificate && result.id) {
        try {
          await studentService.uploadBirthCertificate(result.id, formData.birthCertificate)
          toast.success('Birth certificate uploaded successfully')
        } catch (error) {
          toast.error('Failed to upload birth certificate')
        }
      }

      onSuccess?.(result)
      handleClose()
    } catch (error) {
      console.error('Failed to save student:', error)
      const message = error.response?.data?.error || error.message || 'Failed to save student'
      toast.error(message, { id: loadingToast })
      
      // Handle specific backend validation errors
      if (error.response?.data?.validationErrors) {
        setFormErrors(error.response.data.validationErrors)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setFormData({
      firstName: '', lastName: '', otherNames: '', email: '', phoneNumber: '',
      dateOfBirth: '', gender: '', nationality: 'Ugandan', nin: '', disabilityStatus: '',
      currentClass: '', stream: '', house: '', residenceStatus: 'DAY', combination: '',
      studentId: '', linn: '', district: '', county: '', subCounty: '', parish: '',
      village: '', profilePicture: null, birthCertificate: null
    })
    setFormErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {editingStudent ? 'Edit Student' : 'Student Registration'}
              </h2>
              <p className="text-primary-100 mt-1">
                {editingStudent ? 'Update student information' : 'Register a new student in the system'}
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
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-primary-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-400">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mt-6 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                  />
                  {formErrors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter last name"
                  />
                  {formErrors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                  )}
                </div>

                {/* Other Names */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Names
                  </label>
                  <input
                    type="text"
                    name="otherNames"
                    value={formData.otherNames}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter other names"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="student@email.com"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+256 700 123 456"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      formErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.dateOfBirth}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
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

                {/* Nationality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Nationality"
                  />
                </div>

                {/* NIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    National ID Number (NIN)
                  </label>
                  <input
                    type="text"
                    name="nin"
                    value={formData.nin}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      formErrors.nin ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="14 alphanumeric characters"
                  />
                  {formErrors.nin && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.nin}</p>
                  )}
                </div>

                {/* Disability Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disability Status
                  </label>
                  <input
                    type="text"
                    name="disabilityStatus"
                    value={formData.disabilityStatus}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="None or specify disability"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono"
                    placeholder="Auto-generated"
                  />
                  <p className="text-sm text-gray-500 mt-1">Auto-generated by the system</p>
                </div>

                {/* Current Class */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="currentClass"
                    value={formData.currentClass}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      formErrors.currentClass ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.currentClass && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.currentClass}</p>
                  )}
                </div>

                {/* Stream */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stream <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="stream"
                    value={formData.stream}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      formErrors.stream ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Science, Arts, General"
                  />
                  {formErrors.stream && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.stream}</p>
                  )}
                </div>

                {/* Residence Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Residence Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="residenceStatus"
                    value={formData.residenceStatus}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      formErrors.residenceStatus ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="DAY">Day Student</option>
                    <option value="BOARDING">Boarding Student</option>
                  </select>
                  {formErrors.residenceStatus && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.residenceStatus}</p>
                  )}
                </div>

                {/* House */}
                {formData.residenceStatus === 'BOARDING' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      House <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="house"
                      value={formData.house}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        formErrors.house ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select house</option>
                      {houses.map(house => (
                        <option key={house} value={house}>
                          {house}
                        </option>
                      ))}
                    </select>
                    {formErrors.house && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.house}</p>
                    )}
                  </div>
                )}

                {/* Subject Combination */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Combination
                  </label>
                  <input
                    type="text"
                    name="combination"
                    value={formData.combination}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Math, Physics, Chemistry"
                  />
                </div>

                {/* LINN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LINN (Learner Identification Number)
                  </label>
                  <input
                    type="text"
                    name="linn"
                    value={formData.linn}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Optional LINN number"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Address & Documents</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      formErrors.district ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select district</option>
                    {ugandanDistricts.map(district => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                  {formErrors.district && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.district}</p>
                  )}
                </div>

                {/* County */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    County <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="county"
                    value={formData.county}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      formErrors.county ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter county"
                  />
                  {formErrors.county && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.county}</p>
                  )}
                </div>

                {/* Sub-county */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub-county <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subCounty"
                    value={formData.subCounty}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      formErrors.subCounty ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter sub-county"
                  />
                  {formErrors.subCounty && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.subCounty}</p>
                  )}
                </div>

                {/* Parish */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parish <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="parish"
                    value={formData.parish}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      formErrors.parish ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter parish"
                  />
                  {formErrors.parish && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.parish}</p>
                  )}
                </div>

                {/* Village */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Village <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      formErrors.village ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter village"
                  />
                  {formErrors.village && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.village}</p>
                  )}
                </div>
              </div>

              {/* File Uploads */}
              <div className="space-y-6">
                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label className="cursor-pointer">
                        <span className="text-primary-600 font-medium">Upload a file</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, 'profilePicture')}
                          className="hidden"
                        />
                      </label>
                      <p className="text-gray-500">JPG, PNG up to 5MB</p>
                    </div>
                    {formData.profilePicture && (
                      <p className="text-sm text-green-600 mt-2">
                        File selected: {formData.profilePicture.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Birth Certificate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birth Certificate
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label className="cursor-pointer">
                        <span className="text-primary-600 font-medium">Upload a file</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handleFileChange(e, 'birthCertificate')}
                          className="hidden"
                        />
                      </label>
                      <p className="text-gray-500">JPG, PNG, PDF up to 5MB</p>
                    </div>
                    {formData.birthCertificate && (
                      <p className="text-sm text-green-600 mt-2">
                        File selected: {formData.birthCertificate.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
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
              {currentStep < 3 ? (
                <Button
                  onClick={nextStep}
                  disabled={submitting}
                  className="flex items-center"
                >
                  Next
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner className="w-4 h-4 mr-2" />
                      {editingStudent ? 'Updating...' : 'Registering...'}
                    </>
                  ) : (
                    editingStudent ? 'Update Student' : 'Register Student'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default StudentRegistration