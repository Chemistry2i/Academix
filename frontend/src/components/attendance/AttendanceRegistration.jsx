import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import { attendanceService } from '../../services/attendanceService'
import toast from 'react-hot-toast'

const AttendanceRegistration = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  selectedClass = null 
}) => {
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [students, setStudents] = useState([])
  const [formData, setFormData] = useState({
    classCode: '',
    date: '',
    period: 1,
    subjectCode: '',
    teacherCode: '',
    notes: '',
    attendanceType: 'CLASS'
  })

  const [attendance, setAttendance] = useState({})
  const [bulkAction, setBulkAction] = useState('')

  const attendanceTypes = [
    { value: 'CLASS', label: 'Class Session' },
    { value: 'ASSEMBLY', label: 'Morning Assembly' },
    { value: 'EXAM', label: 'Examination' },
    { value: 'EVENT', label: 'School Event' },
    { value: 'GAMES', label: 'Games/Sports' }
  ]

  const periods = Array.from({ length: 10 }, (_, i) => i + 1)

  const allClasses = [
    'S1A', 'S1B', 'S1C',
    'S2A', 'S2B', 'S2C', 
    'S3A', 'S3B', 'S3C',
    'S4A', 'S4B', 'S4C',
    'S5 PCM', 'S5 PCB', 'S5 HEG', 'S5 BCM',
    'S6 PCM', 'S6 PCB', 'S6 HEG', 'S6 BCM'
  ]

  const allSubjects = [
    'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'Literature', 'Economics', 'Commerce',
    'Accounting', 'Computer Studies', 'French', 'Latin', 'RE',
    'Fine Art', 'Music', 'Physical Education', 'Agriculture',
    'Political Education', 'General Paper', 'Subsidiary ICT'
  ]

  useEffect(() => {
    if (isOpen) {
      setFormErrors({})
      setStudents([])
      setAttendance({})
      
      const today = new Date().toISOString().split('T')[0]
      
      setFormData({
        classCode: selectedClass || '',
        date: today,
        period: 1,
        subjectCode: '',
        teacherCode: '',
        notes: '',
        attendanceType: 'CLASS'
      })
    }
  }, [isOpen, selectedClass])

  useEffect(() => {
    if (formData.classCode) {
      fetchStudents()
    }
  }, [formData.classCode])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      // Mock student data for now - in real app this would come from API
      const mockStudents = generateMockStudents(formData.classCode)
      setStudents(mockStudents)
      
      // Initialize attendance state
      const initialAttendance = {}
      mockStudents.forEach(student => {
        initialAttendance[student.id] = 'PRESENT'
      })
      setAttendance(initialAttendance)
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const generateMockStudents = (classCode) => {
    const count = Math.floor(Math.random() * 15) + 25 // 25-40 students
    const students = []
    
    for (let i = 1; i <= count; i++) {
      students.push({
        id: `STU${String(i).padStart(3, '0')}`,
        firstName: `Student${i}`,
        lastName: `LastName${i}`,
        studentNumber: `${classCode}/${String(i).padStart(3, '0')}`,
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE'
      })
    }
    
    return students.sort((a, b) => `${a.lastName}, ${a.firstName}`.localeCompare(`${b.lastName}, ${b.firstName}`))
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.classCode?.trim()) {
      errors.classCode = 'Class is required'
    }

    if (!formData.date) {
      errors.date = 'Date is required'
    }

    if (!formData.subjectCode?.trim() && formData.attendanceType === 'CLASS') {
      errors.subjectCode = 'Subject is required for class sessions'
    }

    if (!formData.teacherCode?.trim()) {
      errors.teacherCode = 'Teacher code is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    setFormData(prev => ({
      ...prev,
      [name]: name === 'period' ? parseInt(value) || 1 : value
    }))
  }

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const handleBulkAction = () => {
    if (!bulkAction) return

    const newAttendance = { ...attendance }
    students.forEach(student => {
      newAttendance[student.id] = bulkAction
    })
    setAttendance(newAttendance)
    setBulkAction('')
    toast.success(`Marked all students as ${bulkAction.toLowerCase()}`)
  }

  const getAttendanceSummary = () => {
    const summary = {
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      EXCUSED: 0
    }

    Object.values(attendance).forEach(status => {
      summary[status] = (summary[status] || 0) + 1
    })

    return summary
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    if (students.length === 0) {
      toast.error('No students to mark attendance for')
      return
    }

    try {
      setLoading(true)
      
      const attendanceRecords = students.map(student => ({
        studentId: student.id,
        status: attendance[student.id] || 'PRESENT',
        remarks: ''
      }))

      const submitData = {
        ...formData,
        attendanceRecords
      }

      await attendanceService.markBulkAttendance(submitData)
      toast.success('Attendance recorded successfully!')
      
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to save attendance:', error)
      toast.error(error?.message || 'Failed to save attendance. Please try again.')
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

  const summary = getAttendanceSummary()

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
          className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Mark Attendance
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Record student attendance for class session
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
            {/* Session Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="classCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Class *
                </label>
                <select
                  id="classCode"
                  name="classCode"
                  value={formData.classCode}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.classCode ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value="">Select a class</option>
                  {allClasses.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
                {formErrors.classCode && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.classCode}</p>
                )}
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.date ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {formErrors.date && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>
                )}
              </div>

              <div>
                <label htmlFor="attendanceType" className="block text-sm font-medium text-gray-700 mb-2">
                  Attendance Type *
                </label>
                <select
                  id="attendanceType"
                  name="attendanceType"
                  value={formData.attendanceType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={loading}
                >
                  {attendanceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Period and Subject (for CLASS type) */}
            {formData.attendanceType === 'CLASS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
                    Period *
                  </label>
                  <select
                    id="period"
                    name="period"
                    value={formData.period}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={loading}
                  >
                    {periods.map((period) => (
                      <option key={period} value={period}>
                        Period {period}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="subjectCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subjectCode"
                    name="subjectCode"
                    value={formData.subjectCode}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      formErrors.subjectCode ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  >
                    <option value="">Select a subject</option>
                    {allSubjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  {formErrors.subjectCode && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.subjectCode}</p>
                  )}
                </div>
              </div>
            )}

            {/* Teacher */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="teacherCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher Code *
                </label>
                <input
                  type="text"
                  id="teacherCode"
                  name="teacherCode"
                  value={formData.teacherCode}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.teacherCode ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., TCH001"
                  disabled={loading}
                />
                {formErrors.teacherCode && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.teacherCode}</p>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <input
                  type="text"
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Optional notes..."
                  disabled={loading}
                />
              </div>
            </div>

            {/* Attendance Summary */}
            {students.length > 0 && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Attendance Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Present:</span>
                    <span className="font-semibold text-green-600">{summary.PRESENT}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Absent:</span>
                    <span className="font-semibold text-red-600">{summary.ABSENT}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Late:</span>
                    <span className="font-semibold text-yellow-600">{summary.LATE}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Excused:</span>
                    <span className="font-semibold text-blue-600">{summary.EXCUSED}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Student List */}
            {students.length > 0 && (
              <div className="border rounded-lg">
                <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-900">
                    Student Attendance ({students.length} students)
                  </h4>
                  <div className="flex items-center space-x-2">
                    <select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded"
                      disabled={loading}
                    >
                      <option value="">Bulk Actions</option>
                      <option value="PRESENT">Mark All Present</option>
                      <option value="ABSENT">Mark All Absent</option>
                      <option value="LATE">Mark All Late</option>
                      <option value="EXCUSED">Mark All Excused</option>
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleBulkAction}
                      disabled={!bulkAction || loading}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {students.map((student, index) => (
                    <div key={student.id} className={`flex items-center justify-between p-3 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500 w-6">{index + 1}</span>
                        <div>
                          <div className="font-medium text-sm">{student.lastName}, {student.firstName}</div>
                          <div className="text-xs text-gray-500">{student.studentNumber}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((status) => (
                          <label key={status} className="flex items-center">
                            <input
                              type="radio"
                              name={`attendance_${student.id}`}
                              value={status}
                              checked={attendance[student.id] === status}
                              onChange={() => handleAttendanceChange(student.id, status)}
                              className={`h-4 w-4 border-gray-300 ${
                                status === 'PRESENT' ? 'text-green-600 focus:ring-green-500' :
                                status === 'ABSENT' ? 'text-red-600 focus:ring-red-500' :
                                status === 'LATE' ? 'text-yellow-600 focus:ring-yellow-500' :
                                'text-blue-600 focus:ring-blue-500'
                              }`}
                              disabled={loading}
                            />
                            <span className={`ml-1 text-xs ${
                              status === 'PRESENT' ? 'text-green-600' :
                              status === 'ABSENT' ? 'text-red-600' :
                              status === 'LATE' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`}>
                              {status.charAt(0)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                disabled={loading || students.length === 0}
                className="flex items-center"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Recording...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Record Attendance
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

export default AttendanceRegistration