import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import { timetableService } from '../../services/timetableService'
import { teacherService } from '../../services/teacherService'
import { classService } from '../../services/classService'
import { subjectService } from '../../services/subjectService'
import toast from 'react-hot-toast'

const TimetableRegistration = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingEntry = null 
}) => {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formErrors, setFormErrors] = useState({})
  const [conflictCheck, setConflictCheck] = useState(null)
  
  // Dynamic data from API
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [rooms, setRooms] = useState([])
  
  const [formData, setFormData] = useState({
    classCode: '',
    subjectCode: '',
    teacherId: '',
    dayOfWeek: 'MONDAY',
    period: 1,
    startTime: '',
    endTime: '',
    roomNumber: '',
    academicYear: '2025/2026',
    term: 1,
    isLabSession: false,
    sessionType: 'NORMAL',
    notes: ''
  })

  const daysOfWeek = [
    { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' },
    { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' },
    { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' }
  ]

  const sessionTypes = [
    { value: 'NORMAL', label: 'Normal Class' },
    { value: 'PRACTICAL', label: 'Practical Session' },
    { value: 'EXAM', label: 'Examination' },
    { value: 'ASSEMBLY', label: 'Assembly' },
    { value: 'BREAK', label: 'Break Time' },
    { value: 'LUNCH', label: 'Lunch Break' },
    { value: 'SPORTS', label: 'Sports/Games' },
    { value: 'STUDY', label: 'Study Session' }
  ]

  const periods = Array.from({ length: 10 }, (_, i) => i + 1)
  const academicYears = ['2025/2026', '2024/2025', '2023/2024']

  // Predefined rooms - can be made dynamic later
  const commonRooms = [
    'Room 101', 'Room 102', 'Room 103', 'Room 104', 'Room 105',
    'Physics Lab', 'Chemistry Lab', 'Biology Lab', 'Computer Lab',
    'Library', 'Assembly Hall', 'Sports Field', 'Gymnasium'
  ]

  // Load dynamic data from API
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true)
        
        const [classesResponse, teachersResponse, subjectsResponse] = await Promise.all([
          classService.getClasses().catch(err => {
            console.warn('Failed to load classes:', err)
            return []
          }),
          teacherService.getTeachers(true).catch(err => {
            console.warn('Failed to load teachers:', err)
            return { teachers: [] }
          }),
          subjectService.getAllSubjects().catch(err => {
            console.warn('Failed to load subjects:', err)
            return []
          })
        ])

        setClasses(Array.isArray(classesResponse) ? classesResponse : [])
        setTeachers(teachersResponse.teachers || [])
        setSubjects(Array.isArray(subjectsResponse) ? subjectsResponse : [])
        setRooms(commonRooms) // Using predefined rooms for now
        
      } catch (error) {
        console.error('Error loading initial data:', error)
        toast.error('Failed to load form data')
      } finally {
        setInitialLoading(false)
      }
    }

    if (isOpen) {
      loadInitialData()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && !initialLoading) {
      setFormErrors({})
      setConflictCheck(null)
      if (editingEntry) {
        setFormData({
          classCode: editingEntry.className || '',
          subjectCode: editingEntry.subjectCode || '',
          teacherId: editingEntry.teacherId || '',
          dayOfWeek: editingEntry.dayOfWeek || 'MONDAY',
          period: editingEntry.periodNumber || 1,
          startTime: editingEntry.startTime || '',
          endTime: editingEntry.endTime || '',
          roomNumber: editingEntry.room || '',
          academicYear: editingEntry.academicYear || '2025/2026',
          term: editingEntry.term || 1,
          isLabSession: editingEntry.isDoublePeriod || false,
          sessionType: editingEntry.periodType || 'NORMAL',
          notes: editingEntry.notes || ''
        })
      } else {
        setFormData({
          classCode: '',
          subjectCode: '',
          teacherId: '',
          dayOfWeek: 'MONDAY',
          period: 1,
          startTime: '',
          endTime: '',
          roomNumber: '',
          academicYear: '2025/2026',
          term: 1,
          isLabSession: false,
          sessionType: 'NORMAL',
          notes: ''
        })
      }
    }
  }, [isOpen, editingEntry, initialLoading])

  const validateForm = () => {
    const errors = {}

    if (!formData.classCode?.trim()) {
      errors.classCode = 'Class is required'
    }

    if (!formData.subjectCode?.trim()) {
      errors.subjectCode = 'Subject is required'
    }

    if (!formData.teacherId) {
      errors.teacherId = 'Teacher is required'
    }

    if (!formData.startTime) {
      errors.startTime = 'Start time is required'
    }

    if (!formData.endTime) {
      errors.endTime = 'End time is required'
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      errors.endTime = 'End time must be after start time'
    }

    if (!formData.roomNumber?.trim()) {
      errors.roomNumber = 'Room/Location is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }))

    // Clear conflict check when key fields change
    if (['classCode', 'teacherId', 'dayOfWeek', 'period', 'startTime', 'endTime'].includes(name)) {
      setConflictCheck(null)
    }
  }

  const checkForConflicts = async () => {
    if (!formData.classCode || !formData.teacherId || !formData.dayOfWeek || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields before checking conflicts')
      return
    }

    try {
      setLoading(true)
      const conflicts = await timetableService.checkTimetableConflicts({
        className: formData.classCode,
        teacherId: parseInt(formData.teacherId),
        dayOfWeek: formData.dayOfWeek,
        periodNumber: formData.period,
        startTime: formData.startTime,
        endTime: formData.endTime,
        academicYear: formData.academicYear,
        term: formData.term,
        excludeId: editingEntry?.id
      })

      setConflictCheck(conflicts)
      
      if (conflicts.hasConflicts) {
        toast.warning('Conflicts detected! Please review before proceeding.')
      } else {
        toast.success('No conflicts detected!')
      }
    } catch (error) {
      console.error('Error checking conflicts:', error)
      toast.error('Failed to check conflicts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    // Warn about conflicts if they exist
    if (conflictCheck?.hasConflicts) {
      if (!window.confirm('There are conflicts with this timetable entry. Do you want to proceed anyway?')) {
        return
      }
    }

    try {
      setLoading(true)
      
      // Map frontend field names to backend field names with proper data types
      const mappedData = {
        className: formData.classCode,
        periodNumber: parseInt(formData.period),
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
        subjectCode: formData.subjectCode,
        teacherId: parseInt(formData.teacherId),
        room: formData.roomNumber,
        academicYear: formData.academicYear,
        term: parseInt(formData.term),
        isDoublePeriod: formData.isLabSession,
        periodType: formData.sessionType === 'NORMAL' ? 'LESSON' : formData.sessionType,
        notes: formData.notes || null,
        isActive: true
      }
      
      if (editingEntry) {
        await timetableService.updateTimetableEntry(editingEntry.id, mappedData)
        toast.success('Timetable entry updated successfully!')
      } else {
        await timetableService.createTimetableEntry(mappedData)
        toast.success('Timetable entry created successfully!')
      }
      
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to save timetable entry:', error)
      toast.error(error?.message || 'Failed to save timetable entry. Please try again.')
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
          className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editingEntry ? 'Edit Timetable Entry' : 'Create Timetable Entry'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {editingEntry ? 'Update timetable entry details' : 'Enter timetable entry details below'}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading || initialLoading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {initialLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-3 text-gray-600">Loading form data...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
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
                  disabled={loading || initialLoading}
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls.id || cls.className} value={cls.className || cls.name}>
                      {cls.className || cls.name}
                    </option>
                  ))}
                </select>
                {formErrors.classCode && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.classCode}</p>
                )}
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
                  disabled={loading || initialLoading}
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id || subject.code} value={subject.code || subject.subjectCode}>
                      {subject.name || subject.subjectName}
                    </option>
                  ))}
                </select>
                {formErrors.subjectCode && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.subjectCode}</p>
                )}
              </div>

              <div>
                <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher *
                </label>
                <select
                  id="teacherId"
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.teacherId ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading || initialLoading}
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName} ({teacher.employeeId || teacher.code})
                    </option>
                  ))}
                </select>
                {formErrors.teacherId && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.teacherId}</p>
                )}
              </div>
            </div>

            {/* Schedule Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 mb-2">
                  Day of Week *
                </label>
                <select
                  id="dayOfWeek"
                  name="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={loading}
                >
                  {daysOfWeek.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

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
                <label htmlFor="sessionType" className="block text-sm font-medium text-gray-700 mb-2">
                  Session Type *
                </label>
                <select
                  id="sessionType"
                  name="sessionType"
                  value={formData.sessionType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={loading}
                >
                  {sessionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time and Room */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.startTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {formErrors.startTime && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.startTime}</p>
                )}
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.endTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {formErrors.endTime && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.endTime}</p>
                )}
              </div>

              <div>
                <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Room/Location *
                </label>
                <select
                  id="roomNumber"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.roomNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading || initialLoading}
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
                {formErrors.roomNumber && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.roomNumber}</p>
                )}
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

            {/* Additional Options */}
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isLabSession"
                  checked={formData.isLabSession}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-700">Laboratory Session</span>
              </label>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Additional notes or special instructions..."
                disabled={loading}
              />
            </div>

            {/* Conflict Check */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Conflict Check</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={checkForConflicts}
                  disabled={loading}
                  className="flex items-center"
                >
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Check Conflicts
                </Button>
              </div>
              
              {conflictCheck && (
                <div className={`p-3 rounded-lg ${conflictCheck.hasConflicts ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                  {conflictCheck.hasConflicts ? (
                    <div>
                      <div className="flex items-center text-red-800 mb-2">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                        <span className="font-medium">Conflicts Detected</span>
                      </div>
                      {conflictCheck.conflicts && conflictCheck.conflicts.length > 0 && (
                        <ul className="text-sm text-red-700 space-y-1">
                          {conflictCheck.conflicts.map((conflict, index) => (
                            <li key={index}>• {conflict}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center text-green-800">
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      <span>No conflicts detected</span>
                    </div>
                  )}
                </div>
              )}
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
                    {editingEntry ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    {editingEntry ? 'Update Entry' : 'Create Entry'}
                  </>
                )}
              </Button>
            </div>
          </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TimetableRegistration