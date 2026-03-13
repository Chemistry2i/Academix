import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import {
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import StatCard from '../components/common/StatCard'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import { attendanceService } from '../services/attendanceService'
import { classService } from '../services/classService'
import { studentService } from '../services/studentService'
import { teacherPortalService } from '../services/teacherPortalService'
import AttendanceRegistration from '../components/attendance/AttendanceRegistration'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

const normalizeString = (value) => String(value || '').trim().toLowerCase()
const getClassName = (item) => item?.name || item?.className || item?.currentClass || item?.schoolClass?.name || ''
const getStudentKey = (student) => String(student?.id || student?.studentId || '')
const formatIsoDate = (date) => new Date(date).toISOString().split('T')[0]

const getAttendanceReason = (record) => {
  return (
    record?.absenceReason ||
    record?.absenceNote ||
    record?.reason ||
    record?.remarks ||
    record?.comment ||
    record?.note ||
    ''
  )
}

const getTermStartDate = (baseDate) => {
  const date = new Date(baseDate)
  const year = date.getFullYear()
  const month = date.getMonth() + 1

  if (month <= 4) return formatIsoDate(new Date(year, 0, 1))
  if (month <= 8) return formatIsoDate(new Date(year, 4, 1))
  return formatIsoDate(new Date(year, 8, 1))
}

const Attendance = () => {
  const location = useLocation()
  const { hasAnyRole, user } = useAuth()
  const isTeacherPortal = location.pathname.startsWith('/teacher')
  const isStudentPortal = location.pathname.startsWith('/student')
  const canManageAttendance = !isStudentPortal && hasAnyRole(['ADMIN', 'TEACHER', 'CLASS_TEACHER'])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendanceRate: 0,
    totalStudents: 0
  })
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedClass, setSelectedClass] = useState('')
  const [classes, setClasses] = useState([])
  const [showMarkAttendance, setShowMarkAttendance] = useState(false)
  const [viewRecord, setViewRecord] = useState(null)
  const [quickMarkStudents, setQuickMarkStudents] = useState([])
  const [quickMarkStatuses, setQuickMarkStatuses] = useState({})
  const [quickMarkSessionType, setQuickMarkSessionType] = useState('FULL_DAY')
  const [quickMarkAcademicYear, setQuickMarkAcademicYear] = useState('2025/2026')
  const [quickMarkTerm, setQuickMarkTerm] = useState(1)
  const [quickMarkLoading, setQuickMarkLoading] = useState(false)
  const [quickMarkSaving, setQuickMarkSaving] = useState(false)
  const [studentScopedId, setStudentScopedId] = useState('')
  const [studentScopedClass, setStudentScopedClass] = useState('')
  const [studentStartDate, setStudentStartDate] = useState(new Date().toISOString().split('T')[0])
  const [studentEndDate, setStudentEndDate] = useState(new Date().toISOString().split('T')[0])
  const [studentPreset, setStudentPreset] = useState('TODAY')
  const [studentInsights, setStudentInsights] = useState({
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: 0,
    rate: 0,
    streak: 0,
    risk: 'LOW'
  })

  const quickSummary = Object.values(quickMarkStatuses).reduce((summary, status) => {
    const value = String(status || '').toUpperCase()
    summary[value] = (summary[value] || 0) + 1
    return summary
  }, { PRESENT: 0, ABSENT: 0, LATE: 0, SICK: 0 })

  useEffect(() => {
    loadAttendanceData()
    loadAttendanceStatistics()
  }, [selectedDate, selectedClass, studentStartDate, studentEndDate])

  useEffect(() => {
    if (!isStudentPortal) return
    loadStudentInsights()
  }, [isStudentPortal, studentScopedId])

  useEffect(() => {
    loadClassScope()
  }, [isTeacherPortal, isStudentPortal, user?.email])

  useEffect(() => {
    if (!isTeacherPortal) return
    loadQuickMarkStudents()
  }, [isTeacherPortal, selectedClass])

  const loadClassScope = async () => {
    try {
      if (isStudentPortal) {
        const studentPayload = await studentService.getStudents(true).catch(() => ({ students: [] }))
        const students = teacherPortalService.normalizeArray(studentPayload, ['students', 'data'])
        const matchedStudent = students.find((student) => {
          return String(student.email || '').toLowerCase() === String(user?.email || '').toLowerCase()
        }) || null

        const className = getClassName(matchedStudent)
        setStudentScopedClass(className)
        setStudentScopedId(String(matchedStudent?.id || matchedStudent?.studentId || ''))
        setClasses(className ? [className] : [])
        setSelectedClass(className || '')
        return
      }

      const classPayload = await classService.getClasses().catch(() => [])
      const allClasses = teacherPortalService.normalizeArray(classPayload, ['classes', 'data'])

      let visibleClasses = allClasses
      if (isTeacherPortal) {
        const scope = await teacherPortalService.getTeacherContext(user, { classes: allClasses })
        visibleClasses = scope.assignedClasses || []
      }

      const classNames = [...new Set(visibleClasses.map((item) => getClassName(item)).filter(Boolean))]
      setClasses(classNames)
      setSelectedClass((current) => {
        if (current && classNames.includes(current)) return current
        return isTeacherPortal ? classNames[0] || '' : current
      })
    } catch (error) {
      console.error('Failed to load class scope:', error)
      setClasses([])
    }
  }

  const loadQuickMarkStudents = async () => {
    if (!selectedClass) {
      setQuickMarkStudents([])
      setQuickMarkStatuses({})
      return
    }

    try {
      setQuickMarkLoading(true)
      const studentPayload = await studentService.getStudents(true).catch(() => ({ students: [] }))
      const allStudents = teacherPortalService.normalizeArray(studentPayload, ['students', 'data'])
      const filteredStudents = allStudents
        .filter((student) => normalizeString(getClassName(student)) === normalizeString(selectedClass))
        .sort((left, right) => {
          const leftName = `${left?.firstName || ''} ${left?.lastName || ''}`.trim()
          const rightName = `${right?.firstName || ''} ${right?.lastName || ''}`.trim()
          return leftName.localeCompare(rightName)
        })

      setQuickMarkStudents(filteredStudents)
      setQuickMarkStatuses((current) => {
        const next = {}
        filteredStudents.forEach((student) => {
          const key = getStudentKey(student)
          next[key] = current[key] || 'PRESENT'
        })
        return next
      })
    } catch (error) {
      console.error('Failed to load quick-mark students:', error)
      toast.error('Failed to load students for quick mark')
      setQuickMarkStudents([])
      setQuickMarkStatuses({})
    } finally {
      setQuickMarkLoading(false)
    }
  }

  const loadAttendanceData = async () => {
    try {
      setLoading(true)
      if (isStudentPortal) {
        if (!studentScopedId) {
          setAttendance([])
          return
        }
        const studentRecords = await attendanceService.getStudentAttendance(
          studentScopedId,
          studentStartDate,
          studentEndDate
        )
        const records = teacherPortalService.normalizeArray(studentRecords, ['attendance', 'records', 'data'])
        setAttendance(records || [])
        return
      }

      const data = await attendanceService.getAttendanceByDate(
        selectedDate, 
        selectedClass || null
      )
      setAttendance(data || [])
    } catch (error) {
      console.error('Failed to load attendance:', error)
      toast.error('Failed to load attendance data')
      setAttendance([])
    } finally {
      setLoading(false)
    }
  }

  const loadAttendanceStatistics = async () => {
    try {
      if (isStudentPortal) {
        if (!studentScopedId) {
          setStats({ present: 0, absent: 0, late: 0, excused: 0, attendanceRate: 0, totalStudents: 0 })
          return
        }
        const studentRecords = await attendanceService.getStudentAttendance(
          studentScopedId,
          studentStartDate,
          studentEndDate
        )
        const records = teacherPortalService.normalizeArray(studentRecords, ['attendance', 'records', 'data'])
        const present = records.filter((item) => item.status === 'PRESENT').length
        const absent = records.filter((item) => item.status === 'ABSENT').length
        const late = records.filter((item) => item.status === 'LATE').length
        const excused = records.filter((item) => item.status === 'EXCUSED').length
        const total = records.length || 0
        setStats({
          present,
          absent,
          late,
          excused,
          attendanceRate: total ? Math.round((present / total) * 100) : 0,
          totalStudents: total
        })
        return
      }

      const statisticsData = await attendanceService.getAttendanceStatistics(
        selectedDate,
        selectedDate,
        selectedClass ? [selectedClass] : null
      )
      setStats({
        present: statisticsData.presentCount || 0,
        absent: statisticsData.absentCount || 0,
        late: statisticsData.lateCount || 0,
        excused: statisticsData.excusedCount || 0,
        attendanceRate: statisticsData.attendanceRate || 0,
        totalStudents: statisticsData.totalStudents || 0
      })
    } catch (error) {
      console.error('Failed to load attendance statistics:', error)
      setStats({
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        attendanceRate: 0,
        totalStudents: 0
      })
    }
  }

  const loadStudentInsights = async () => {
    if (!studentScopedId) {
      setStudentInsights({ present: 0, absent: 0, late: 0, excused: 0, total: 0, rate: 0, streak: 0, risk: 'LOW' })
      return
    }

    try {
      const today = new Date()
      const start = new Date(today)
      start.setDate(today.getDate() - 29)

      const payload = await attendanceService.getStudentAttendance(
        studentScopedId,
        formatIsoDate(start),
        formatIsoDate(today)
      )
      const records = teacherPortalService.normalizeArray(payload, ['attendance', 'records', 'data'])

      const present = records.filter((item) => item.status === 'PRESENT').length
      const absent = records.filter((item) => item.status === 'ABSENT').length
      const late = records.filter((item) => item.status === 'LATE').length
      const excused = records.filter((item) => item.status === 'EXCUSED').length
      const total = records.length || 0
      const rate = total ? Math.round(((present + late + excused) / total) * 100) : 0

      const sortedByDate = [...records].sort((left, right) => {
        const leftDate = new Date(left?.date || left?.attendanceDate || 0).getTime()
        const rightDate = new Date(right?.date || right?.attendanceDate || 0).getTime()
        return rightDate - leftDate
      })

      let streak = 0
      for (const record of sortedByDate) {
        const status = String(record?.status || '').toUpperCase()
        if (status === 'PRESENT') {
          streak += 1
        } else {
          break
        }
      }

      const risk = rate < 75 ? 'HIGH' : rate < 90 ? 'MEDIUM' : 'LOW'
      setStudentInsights({ present, absent, late, excused, total, rate, streak, risk })
    } catch (error) {
      console.error('Failed to load student attendance insights:', error)
      setStudentInsights({ present: 0, absent: 0, late: 0, excused: 0, total: 0, rate: 0, streak: 0, risk: 'LOW' })
    }
  }

  const applyStudentDatePreset = (preset) => {
    const today = new Date()
    const todayIso = formatIsoDate(today)
    let start = todayIso
    let end = todayIso

    if (preset === 'THIS_WEEK') {
      const weekStart = new Date(today)
      const day = weekStart.getDay()
      const mondayOffset = day === 0 ? -6 : 1 - day
      weekStart.setDate(weekStart.getDate() + mondayOffset)
      start = formatIsoDate(weekStart)
    }

    if (preset === 'THIS_MONTH') {
      start = formatIsoDate(new Date(today.getFullYear(), today.getMonth(), 1))
    }

    if (preset === 'TERM') {
      start = getTermStartDate(today)
    }

    setStudentPreset(preset)
    setStudentStartDate(start)
    setStudentEndDate(end)
    setSelectedDate(end)
  }

  const handleStudentDateChange = (value) => {
    setSelectedDate(value)
    setStudentStartDate(value)
    setStudentEndDate(value)
    setStudentPreset('CUSTOM')
  }

  const managementColumns = [
    {
      key: 'studentNumber',
      header: 'Student Number',
      render: (value) => (
        <span className="font-mono text-sm">{value || 'N/A'}</span>
      )
    },
    {
      key: 'studentName',
      header: 'Student Name',
      render: (value) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'className',
      header: 'Class',
      render: (value) => (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
          {value}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'PRESENT'
            ? 'bg-green-100 text-green-800'
            : value === 'ABSENT'
            ? 'bg-red-100 text-red-800'
            : value === 'LATE'
            ? 'bg-yellow-100 text-yellow-800'
            : value === 'EXCUSED'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value || 'Unknown'}
        </span>
      )
    },
    {
      key: 'checkInTime',
      header: 'Check In',
      render: (value) => value || 'N/A'
    },
    {
      key: 'sessionType',
      header: 'Session',
      render: (value) => (
        <span className="text-sm text-gray-600">
          {value?.replace('_', ' ') || 'Full Day'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewAttendance(record)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-blue-200 rounded text-blue-600 hover:bg-blue-50 transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
            View
          </button>
          {canManageAttendance && (
            <>
              <button
                onClick={() => handleEditAttendance(record)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-yellow-200 rounded text-yellow-600 hover:bg-yellow-50 transition-colors"
                title="Edit Attendance"
              >
                <PencilIcon className="w-4 h-4" />
                Edit
              </button>
              {hasAnyRole(['ADMIN']) && !isTeacherPortal && !isStudentPortal && (
                <button
                  onClick={() => handleDeleteAttendance(record)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-red-200 rounded text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete Record"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      )
    }
  ]

  const studentColumns = [
    {
      key: 'date',
      header: 'Date',
      render: (value) => value || selectedDate
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'PRESENT'
            ? 'bg-green-100 text-green-800'
            : value === 'ABSENT'
            ? 'bg-red-100 text-red-800'
            : value === 'LATE'
            ? 'bg-yellow-100 text-yellow-800'
            : value === 'EXCUSED'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value || 'Unknown'}
        </span>
      )
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (_, record) => (
        <span className="text-sm text-gray-700">
          {record?.subjectName || record?.subject || record?.courseName || 'General'}
        </span>
      )
    },
    {
      key: 'period',
      header: 'Period',
      render: (_, record) => {
        const periodLabel =
          record?.periodName ||
          record?.period ||
          record?.lessonPeriod ||
          (record?.sessionType ? record.sessionType.replace('_', ' ') : '')
        return <span className="text-sm text-gray-600">{periodLabel || 'N/A'}</span>
      }
    },
    {
      key: 'sessionType',
      header: 'Session',
      render: (value) => (
        <span className="text-sm text-gray-600">
          {value?.replace('_', ' ') || 'Full Day'}
        </span>
      )
    },
    {
      key: 'checkInTime',
      header: 'Check In',
      render: (value) => value || 'N/A'
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewAttendance(record)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-blue-200 rounded text-blue-600 hover:bg-blue-50 transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
            View
          </button>
        </div>
      )
    }
  ]

  const columns = isStudentPortal ? studentColumns : managementColumns

  const handleViewAttendance = (record) => {
    setViewRecord(record)
  }

  const handleEditAttendance = (record) => {
    // Implementation for editing attendance
    toast.info('Edit attendance functionality coming soon!')
  }

  const handleDeleteAttendance = async (record) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will delete the attendance record for ${record.studentName}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
      customClass: {
        container: 'font-outfit',
        popup: 'rounded-xl'
      }
    })

    if (result.isConfirmed) {
      try {
        await attendanceService.deleteAttendance(record.id)
        toast.success('Attendance record deleted successfully')
        loadAttendanceData()
        loadAttendanceStatistics()
      } catch (error) {
        console.error('Failed to delete attendance:', error)
        toast.error('Failed to delete attendance record')
      }
    }
  }

  const handleMarkAttendance = () => {
    setShowMarkAttendance(true)
  }

  const handleExportAttendance = async () => {
    try {
      const data = await attendanceService.getDailyReport(
        selectedDate,
        selectedClass ? [selectedClass] : null
      )
      // Implementation for exporting data
      toast.success('Attendance exported successfully')
    } catch (error) {
      console.error('Failed to export attendance:', error)
      toast.error('Failed to export attendance data')
    }
  }

  const handleQuickStatusChange = (student, status) => {
    const key = getStudentKey(student)
    setQuickMarkStatuses((current) => ({
      ...current,
      [key]: status
    }))
  }

  const applyQuickStatusToAll = (status) => {
    setQuickMarkStatuses(() => {
      const next = {}
      quickMarkStudents.forEach((student) => {
        next[getStudentKey(student)] = status
      })
      return next
    })
  }

  const handleSaveQuickMark = async () => {
    if (!selectedClass) {
      toast.error('Select a class before saving attendance')
      return
    }

    if (!quickMarkStudents.length) {
      toast.error('No students found for the selected class')
      return
    }

    const teacherName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Teacher'
    const records = quickMarkStudents
      .map((student) => {
        const studentId = Number(student?.id || student?.studentId)
        if (!Number.isFinite(studentId)) return null

        const studentName = `${student?.firstName || ''} ${student?.lastName || ''}`.trim()
        return {
          studentId,
          className: selectedClass,
          date: selectedDate,
          status: quickMarkStatuses[getStudentKey(student)] || 'PRESENT',
          sessionType: quickMarkSessionType,
          academicYear: quickMarkAcademicYear,
          term: Number(quickMarkTerm),
          studentNumber: student?.studentId || student?.studentNumber || '',
          studentName,
          markedBy: user?.id || null,
          markedByName: teacherName,
        }
      })
      .filter(Boolean)

    if (!records.length) {
      toast.error('Unable to save. Student IDs are missing for this class.')
      return
    }

    try {
      setQuickMarkSaving(true)
      await attendanceService.markBulkAttendance(records)
      toast.success('Attendance saved successfully')
      await Promise.all([loadAttendanceData(), loadAttendanceStatistics()])
    } catch (error) {
      console.error('Failed to save quick mark attendance:', error)
      toast.error(error?.error || error?.message || 'Failed to save attendance')
    } finally {
      setQuickMarkSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-3 text-gray-600">Loading attendance...</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isTeacherPortal ? 'My Attendance Desk' : isStudentPortal ? 'My Attendance' : 'Attendance Management'}</h1>
          <p className="text-gray-600 mt-1">
            {isTeacherPortal
              ? 'Quick-mark your class attendance and review daily records.'
              : isStudentPortal
                ? 'Track your attendance records and daily status.'
                : 'Track and manage student attendance'}
          </p>
        </div>
        {canManageAttendance && (
          <div className="flex items-center space-x-3">
            <Button 
              onClick={handleExportAttendance}
              variant="outline"
              className="flex items-center"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Export
            </Button>
            {!isTeacherPortal && (
              <Button 
                onClick={handleMarkAttendance}
                className="bg-green-600 hover:bg-green-700 flex items-center"
              >
                <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" />
                Take Attendance
              </Button>
            )}
          </div>
        )}
      </div>

      {(isTeacherPortal || isStudentPortal) && (
        <Card>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h3 className="text-sm font-semibold text-amber-900">{isStudentPortal ? 'Student attendance access is view-only' : 'Teacher attendance access is role-scoped'}</h3>
            <p className="text-sm text-amber-800 mt-1">
              {isStudentPortal
                ? 'You can only view your own attendance records.'
                : 'You can only manage attendance for classes assigned to you.'}
            </p>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => (isStudentPortal ? handleStudentDateChange(e.target.value) : setSelectedDate(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {isStudentPortal && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    ['TODAY', 'Today'],
                    ['THIS_WEEK', 'This Week'],
                    ['THIS_MONTH', 'This Month'],
                    ['TERM', 'Term'],
                  ].map(([preset, label]) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => applyStudentDatePreset(preset)}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                        studentPreset === preset
                          ? 'bg-primary-50 border-primary-200 text-primary-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {isStudentPortal ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">My Class</label>
                <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-700 min-w-36">
                  {studentScopedClass || 'Not assigned'}
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                <select
                  id="class"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Classes</option>
                  {classes.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </Card>

      {isTeacherPortal && (
        <Card>
          <div className="p-6 space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Attendance Quick Mark</h3>
                <p className="text-sm text-gray-600">Set statuses for your selected class and save in one action.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={() => applyQuickStatusToAll('PRESENT')}>All Present</Button>
                <Button variant="outline" onClick={() => applyQuickStatusToAll('ABSENT')}>All Absent</Button>
                <Button variant="outline" onClick={() => applyQuickStatusToAll('LATE')}>All Late</Button>
                <Button onClick={handleSaveQuickMark} disabled={quickMarkSaving || quickMarkLoading || !quickMarkStudents.length}>
                  {quickMarkSaving ? 'Saving...' : 'Save Quick Mark'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Session</label>
                <select
                  value={quickMarkSessionType}
                  onChange={(event) => setQuickMarkSessionType(event.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="FULL_DAY">Full Day</option>
                  <option value="MORNING">Morning</option>
                  <option value="AFTERNOON">Afternoon</option>
                  <option value="SPECIFIC_PERIOD">Specific Period</option>
                  <option value="ASSEMBLY">Assembly</option>
                  <option value="GAMES">Games</option>
                  <option value="PREP">Prep</option>
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={quickMarkAcademicYear}
                  onChange={(event) => setQuickMarkAcademicYear(event.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Term</label>
                <select
                  value={quickMarkTerm}
                  onChange={(event) => setQuickMarkTerm(Number(event.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value={1}>Term 1</option>
                  <option value={2}>Term 2</option>
                  <option value={3}>Term 3</option>
                </select>
              </div>
              <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-600">
                <div>Present: <span className="font-semibold text-green-700">{quickSummary.PRESENT || 0}</span></div>
                <div>Absent: <span className="font-semibold text-red-700">{quickSummary.ABSENT || 0}</span></div>
                <div>Late: <span className="font-semibold text-amber-700">{quickSummary.LATE || 0}</span></div>
              </div>
            </div>

            {quickMarkLoading ? (
              <div className="py-8 flex items-center justify-center text-sm text-gray-600">
                <LoadingSpinner />
                <span className="ml-2">Loading class roster...</span>
              </div>
            ) : quickMarkStudents.length ? (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="max-h-80 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {quickMarkStudents.map((student) => {
                        const key = getStudentKey(student)
                        const name = `${student?.firstName || ''} ${student?.lastName || ''}`.trim() || student?.fullName || 'Student'
                        return (
                          <tr key={key}>
                            <td className="px-3 py-2 text-sm text-gray-900">{name}</td>
                            <td className="px-3 py-2 text-sm text-gray-500 font-mono">{student?.studentId || student?.studentNumber || '-'}</td>
                            <td className="px-3 py-2">
                              <select
                                value={quickMarkStatuses[key] || 'PRESENT'}
                                onChange={(event) => handleQuickStatusChange(student, event.target.value)}
                                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                              >
                                <option value="PRESENT">Present</option>
                                <option value="ABSENT">Absent</option>
                                <option value="LATE">Late</option>
                                <option value="SICK">Sick</option>
                              </select>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 p-5 text-sm text-gray-500">
                No students found in this class. Choose another class or verify class enrollment data.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Present"
          value={stats.present}
          icon={UserGroupIcon}
          color="green"
          subtitle={`${stats.totalStudents > 0 ? Math.round((stats.present / stats.totalStudents) * 100) : 0}%`}
        />
        <StatCard
          title="Absent"
          value={stats.absent}
          icon={UserGroupIcon}
          color="red"
          subtitle={`${stats.totalStudents > 0 ? Math.round((stats.absent / stats.totalStudents) * 100) : 0}%`}
        />
        <StatCard
          title="Late"
          value={stats.late}
          icon={CalendarDaysIcon}
          color="yellow"
          subtitle="Arrivals"
        />
        <StatCard
          title="Excused"
          value={stats.excused}
          icon={ClipboardDocumentCheckIcon}
          color="blue"
          subtitle="Absences"
        />
        <StatCard
          title="Attendance Rate"
          value={`${Math.round(stats.attendanceRate)}%`}
          icon={ClipboardDocumentCheckIcon}
          color="purple"
          subtitle={`${stats.totalStudents} total`}
        />
      </div>

      {isStudentPortal && (
        <Card>
          <div className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Last 30 Days Trend</h3>
                <p className="text-xs text-gray-500 mt-1">Quick view of Present, Absent, and Late patterns.</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Streak: {studentInsights.streak} day{studentInsights.streak === 1 ? '' : 's'}
                </span>
                <span className={`px-2 py-1 rounded border ${
                  studentInsights.risk === 'HIGH'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : studentInsights.risk === 'MEDIUM'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-green-50 text-green-700 border-green-200'
                }`}>
                  {studentInsights.risk === 'HIGH' ? 'At Risk' : studentInsights.risk === 'MEDIUM' ? 'Watchlist' : 'On Track'}
                </span>
                <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Rate: {studentInsights.rate}%
                </span>
              </div>
            </div>

            <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden flex">
              {(() => {
                const total = studentInsights.total || 1
                const presentWidth = Math.max(0, (studentInsights.present / total) * 100)
                const absentWidth = Math.max(0, (studentInsights.absent / total) * 100)
                const lateWidth = Math.max(0, (studentInsights.late / total) * 100)

                return (
                  <>
                    <div className="h-full bg-emerald-500" style={{ width: `${presentWidth}%` }} />
                    <div className="h-full bg-red-500" style={{ width: `${absentWidth}%` }} />
                    <div className="h-full bg-amber-500" style={{ width: `${lateWidth}%` }} />
                  </>
                )
              })()}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Present: {studentInsights.present}</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Absent: {studentInsights.absent}</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Late: {studentInsights.late}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Attendance Table */}
      {attendance.length > 0 ? (
        <DataTable
          data={attendance}
          columns={columns}
          searchable
          sortable
          pagination
          pageSize={15}
        />
      ) : (
        <Card>
          <div className="p-12 text-center">
            <ClipboardDocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedDate === new Date().toISOString().split('T')[0] 
                ? "No attendance has been taken today."
                : "No attendance records found for the selected date."}
            </p>
            {canManageAttendance && !isTeacherPortal && !isStudentPortal && (
              <div className="mt-6">
                <Button 
                  onClick={handleMarkAttendance}
                  className="flex items-center mx-auto"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Take Attendance
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Attendance Registration Modal */}
      <AttendanceRegistration
        isOpen={canManageAttendance && showMarkAttendance}
        onClose={() => setShowMarkAttendance(false)}
        onSuccess={loadAttendanceData}
        selectedClass={selectedClass}
      />

      {/* View Attendance Record Modal */}
      <AnimatePresence>
        {viewRecord && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
              style={{ maxHeight: 'calc(100vh - 3rem)' }}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="shrink-0 bg-primary-700 text-white px-6 py-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                      {viewRecord.studentName?.[0] || <UserIcon className="w-7 h-7" />}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{viewRecord.studentName}</h2>
                      <p className="text-primary-200 text-sm mt-0.5">{viewRecord.studentNumber}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          viewRecord.status === 'PRESENT'
                            ? 'bg-green-400/20 text-green-100 ring-1 ring-green-300/40'
                            : viewRecord.status === 'ABSENT'
                              ? 'bg-red-400/20 text-red-100 ring-1 ring-red-300/40'
                              : 'bg-yellow-400/20 text-yellow-100 ring-1 ring-yellow-300/40'
                        }`}>
                          {viewRecord.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewRecord(null)}
                    className="text-white/70 hover:text-white transition-colors mt-1"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Quick-stat strip */}
              <div className="shrink-0 bg-primary-600 text-white px-6 py-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Class</span>
                    <p className="font-medium">{viewRecord.className}{viewRecord.stream ? ` (${viewRecord.stream})` : ''}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Date</span>
                    <p className="font-medium">{viewRecord.date}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Session</span>
                    <p className="font-medium">{viewRecord.sessionType?.replace('_', ' ') || 'Full Day'}</p>
                  </div>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                {/* Attendance Info */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-b border-gray-200">
                    <span className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                      <ClipboardDocumentCheckIcon className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="text-sm font-semibold text-blue-800">Attendance Details</h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Date', viewRecord.date],
                        ['Status', viewRecord.status],
                        ['Reason', getAttendanceReason(viewRecord)],
                        ['Session', viewRecord.sessionType?.replace('_', ' ') || 'Full Day'],
                        ['Class', viewRecord.className],
                        ['Stream', viewRecord.stream],
                      ].filter(([, v]) => v != null && v !== '').map(([label, val], i) => (
                        <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-500 font-medium w-44">{label}</td>
                          <td className="px-4 py-2 text-gray-900">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Times */}
                {(viewRecord.checkInTime || viewRecord.checkOutTime) && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-sky-50 border-b border-gray-200">
                      <span className="w-5 h-5 rounded bg-sky-600 flex items-center justify-center">
                        <CalendarDaysIcon className="w-3 h-3 text-white" />
                      </span>
                      <h3 className="text-sm font-semibold text-sky-800">Check In / Out</h3>
                    </div>
                    <table className="w-full text-sm">
                      <tbody>
                        {[
                          ['Check In', viewRecord.checkInTime],
                          ['Check Out', viewRecord.checkOutTime],
                        ].filter(([, v]) => v != null && v !== '').map(([label, val], i) => (
                          <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2 text-gray-500 font-medium w-44">{label}</td>
                            <td className="px-4 py-2 text-gray-900">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Subject & Staff */}
                {(viewRecord.subjectName || viewRecord.markedByName) && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border-b border-gray-200">
                      <span className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center">
                        <UserGroupIcon className="w-3 h-3 text-white" />
                      </span>
                      <h3 className="text-sm font-semibold text-emerald-800">Subject & Staff</h3>
                    </div>
                    <table className="w-full text-sm">
                      <tbody>
                        {[
                          ['Subject', viewRecord.subjectName],
                          ['Marked By', viewRecord.markedByName],
                        ].filter(([, v]) => v != null && v !== '').map(([label, val], i) => (
                          <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2 text-gray-500 font-medium w-44">{label}</td>
                            <td className="px-4 py-2 text-gray-900">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Absence Notes */}
                {(viewRecord.absenceReason || viewRecord.absenceNote) && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-gray-200">
                      <span className="w-5 h-5 rounded bg-amber-600 flex items-center justify-center">
                        <ClipboardDocumentCheckIcon className="w-3 h-3 text-white" />
                      </span>
                      <h3 className="text-sm font-semibold text-amber-800">Absence Notes</h3>
                    </div>
                    <table className="w-full text-sm">
                      <tbody>
                        {[
                          ['Reason', viewRecord.absenceReason],
                          ['Note', viewRecord.absenceNote],
                        ].filter(([, v]) => v != null && v !== '').map(([label, val], i) => (
                          <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2 text-gray-500 font-medium w-44 align-top">{label}</td>
                            <td className="px-4 py-2 text-gray-900">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-gray-200 px-6 py-4 flex items-center justify-end bg-gray-50">
                <button
                  onClick={() => setViewRecord(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Attendance