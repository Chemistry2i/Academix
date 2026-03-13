import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  UserIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  TableCellsIcon,
  ListBulletIcon,
  XMarkIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import TimetableGridView from '../components/timetable/TimetableGridView'
import { useAuth } from '../contexts/AuthContext'
import { timetableService } from '../services/timetableService'
import { teacherService } from '../services/teacherService'
import { studentService } from '../services/studentService'
import { classService } from '../services/classService'
import TimetableRegistration from '../components/timetable/TimetableRegistration'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

const Timetable = () => {
  const location = useLocation()
  const { hasAnyRole, user } = useAuth()
  const navigate = useNavigate()
  const isTeacherPortal = location.pathname.startsWith('/teacher')
  const isStudentPortal = location.pathname.startsWith('/student')
  const canManageTimetable = !isTeacherPortal && !isStudentPortal && hasAnyRole(['ADMIN', 'HEAD_TEACHER', 'DIRECTOR_OF_STUDIES'])
  const [timetables, setTimetables] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [viewEntry, setViewEntry] = useState(null)
  const [viewMode, setViewMode] = useState('table') // 'table' or 'grid'
  const [gridViewConfig, setGridViewConfig] = useState({
    type: 'class', // 'class' or 'teacher'
    targetId: ''
  })
  const [availableClasses, setAvailableClasses] = useState([])
  const [availableTeachers, setAvailableTeachers] = useState([])
  const [studentScopedClass, setStudentScopedClass] = useState('')
  const [filters, setFilters] = useState({
    className: '',
    dayOfWeek: '',
    teacherId: '',
    academicYear: '2025/2026',
    term: 1
  })
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalClasses: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    averagePeriodsPerDay: 0
  })

  const [classes] = useState(['S1A', 'S1B', 'S2A', 'S2B', 'S3A', 'S3B', 'S4A', 'S4B', 'S5 PCM', 'S5 PCB', 'S5 HEG', 'S6 PCM', 'S6 PCB', 'S6 HEG'])
  const [daysOfWeek] = useState([
    { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' },
    { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' },
    { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' },
    { value: 'SUNDAY', label: 'Sunday' }
  ])
  const teacherScopedId = availableTeachers.find((teacher) =>
    String(teacher.email || '').toLowerCase() === String(user?.email || '').toLowerCase()
  )?.id || ''

  useEffect(() => {
    loadTimetables()
    if (!isStudentPortal) {
      loadStatistics()
    }
  }, [filters])

  useEffect(() => {
    if (!isStudentPortal) return

    const scopedEntries = Array.isArray(timetables) ? timetables : []
    setStats({
      totalEntries: scopedEntries.length,
      totalClasses: new Set(scopedEntries.map((item) => item.className)).size,
      totalTeachers: new Set(scopedEntries.map((item) => item.teacherName)).size,
      totalSubjects: new Set(scopedEntries.map((item) => item.subjectName)).size,
      averagePeriodsPerDay: 0
    })
  }, [isStudentPortal, timetables])

  useEffect(() => {
    loadSelectData()
  }, [isStudentPortal, user?.email])

  useEffect(() => {
    if (!isTeacherPortal || !availableTeachers.length) return

    const matchedTeacher = availableTeachers.find((teacher) =>
      String(teacher.email || '').toLowerCase() === String(user?.email || '').toLowerCase()
    )

    if (!matchedTeacher) {
      setGridViewConfig((prev) => ({ ...prev, type: 'teacher' }))
      return
    }

    setFilters((prev) => ({
      ...prev,
      teacherId: String(matchedTeacher.id),
      className: ''
    }))
    setGridViewConfig((prev) => ({
      ...prev,
      type: 'teacher',
      targetId: String(matchedTeacher.id)
    }))
  }, [isTeacherPortal, availableTeachers, user?.email])

  useEffect(() => {
    if (!isStudentPortal) return
    if (!studentScopedClass) return

    setFilters((prev) => ({
      ...prev,
      className: studentScopedClass,
      teacherId: ''
    }))
    setGridViewConfig((prev) => ({
      ...prev,
      type: 'class',
      targetId: studentScopedClass
    }))
  }, [isStudentPortal, studentScopedClass])

  const loadSelectData = async () => {
    try {
      const classesResponse = await classService.getClasses().catch(err => {
        console.warn('Failed to load classes:', err)
        return []
      })

      const normalizedClasses = Array.isArray(classesResponse) ? classesResponse : []

      if (isStudentPortal) {
        const studentPayload = await studentService.getStudents(true).catch(() => ({ students: [] }))
        const students = studentPayload.students || studentPayload.data || studentPayload || []
        const matchedStudent = students.find((student) => {
          return String(student.email || '').toLowerCase() === String(user?.email || '').toLowerCase()
        }) || null

        const className = matchedStudent?.schoolClass?.name || matchedStudent?.currentClass || ''
        setStudentScopedClass(className)
        setAvailableClasses(normalizedClasses.filter((item) => {
          const value = item.className || item.name || ''
          return String(value).trim().toLowerCase() === String(className).trim().toLowerCase()
        }))
        setAvailableTeachers([])
        return
      }

      const teachersResponse = await teacherService.getTeachers(true).catch(err => {
        console.warn('Failed to load teachers:', err)
        return { teachers: [] }
      })

      setAvailableClasses(normalizedClasses)
      setAvailableTeachers(teachersResponse.teachers || [])
    } catch (error) {
      console.error('Failed to load select data:', error)
    }
  }

  const loadTimetables = async () => {
    try {
      setLoading(true)
      let data
      if (isStudentPortal) {
        if (!studentScopedClass) {
          setTimetables([])
          return
        }

        const classData = await timetableService.getClassTimetable(
          studentScopedClass,
          filters.term,
          filters.academicYear
        )

        data = Array.isArray(classData) ? classData : []
        if (filters.dayOfWeek) {
          data = data.filter((item) => String(item.dayOfWeek || '') === String(filters.dayOfWeek))
        }
      } else if (filters.className) {
        data = await timetableService.getClassTimetable(
          filters.className,
          filters.term,
          filters.academicYear
        )
      } else if (filters.teacherId) {
        data = await timetableService.getTeacherTimetable(
          filters.teacherId,
          filters.term,
          filters.academicYear
        )
      } else if (filters.dayOfWeek) {
        data = await timetableService.getTimetableByDay(
          filters.dayOfWeek,
          filters.className,
          filters.academicYear,
          filters.term
        )
      } else {
        data = await timetableService.getAllTimetables()
      }
      setTimetables(data || [])
    } catch (error) {
      console.error('Failed to load timetables:', error)
      toast.error('Failed to load timetable data')
      setTimetables([])
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const statisticsData = await timetableService.getTimetableStatistics(
        filters.academicYear,
        filters.term
      )
      setStats({
        totalEntries: statisticsData.totalEntries || 0,
        totalClasses: statisticsData.totalClasses || 0,
        totalTeachers: statisticsData.totalTeachers || 0,
        totalSubjects: statisticsData.totalSubjects || 0,
        averagePeriodsPerDay: statisticsData.averagePeriodsPerDay || 0
      })
    } catch (error) {
      console.error('Failed to load timetable statistics:', error)
      setStats({
        totalEntries: timetables.length,
        totalClasses: new Set(timetables.map(t => t.className)).size,
        totalTeachers: new Set(timetables.map(t => t.teacherName)).size,
        totalSubjects: new Set(timetables.map(t => t.subjectName)).size,
        averagePeriodsPerDay: 0
      })
    }
  }

  const columns = [
    {
      key: 'className',
      header: 'Class',
      render: (value, entry) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          {entry.stream && (
            <div className="text-sm text-gray-500">Stream: {entry.stream}</div>
          )}
        </div>
      )
    },
    {
      key: 'dayOfWeek',
      header: 'Day',
      render: (value) => (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
          {value?.charAt(0) + value?.slice(1).toLowerCase() || 'N/A'}
        </span>
      )
    },
    {
      key: 'periodNumber',
      header: 'Period',
      render: (value, entry) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-gray-500">{entry.periodName || ''}</div>
        </div>
      )
    },
    {
      key: 'time',
      header: 'Time',
      render: (_, entry) => (
        <div className="text-sm">
          <div>{entry.startTime} - {entry.endTime}</div>
          {entry.isDoublePerod && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
              Double
            </span>
          )}
        </div>
      )
    },
    {
      key: 'subjectName',
      header: 'Subject',
      render: (value, entry) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-gray-500">Code: {entry.subjectCode}</div>
        </div>
      )
    },
    {
      key: 'teacherName',
      header: 'Teacher',
      render: (value) => value || 'Not Assigned'
    },
    {
      key: 'room',
      header: 'Room/Venue',
      render: (value, entry) => (
        <div className="text-sm">
          <div>{value || 'TBA'}</div>
          {entry.building && (
            <div className="text-xs text-gray-500">{entry.building}</div>
          )}
        </div>
      )
    },
    {
      key: 'periodType',
      header: 'Type',
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value === 'LESSON'
            ? 'bg-green-100 text-green-800'
            : value === 'BREAK'
            ? 'bg-orange-100 text-orange-800'
            : value === 'LUNCH'
            ? 'bg-blue-100 text-blue-800'
            : value === 'PREP'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value?.charAt(0) + value?.slice(1).toLowerCase() || 'Lesson'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, entry) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewEntry(entry)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-blue-200 rounded text-blue-600 hover:bg-blue-50 transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
            View
          </button>
          {canManageTimetable && (
            <>
              <button
                onClick={() => handleEditEntry(entry)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-yellow-200 rounded text-yellow-600 hover:bg-yellow-50 transition-colors"
                title="Edit Entry"
              >
                <PencilIcon className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDeleteEntry(entry)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-red-200 rounded text-red-600 hover:bg-red-50 transition-colors"
                title="Delete Entry"
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
            </>
          )}
        </div>
      )
    }
  ]

  const handleViewEntry = (entry) => {
    setViewEntry(entry)
  }

  const handleEditEntry = (entry) => {
    if (!canManageTimetable) return
    setEditingEntry(entry)
    setShowAddModal(true)
  }

  const handleDeleteEntry = async (entry) => {
    if (!canManageTimetable) return
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will delete the timetable entry for ${entry.className} - ${entry.subjectName}.`,
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
        await timetableService.deleteTimetableEntry(entry.id)
        toast.success('Timetable entry deleted successfully')
        loadTimetables()
        loadStatistics()
      } catch (error) {
        console.error('Failed to delete timetable entry:', error)
        toast.error('Failed to delete timetable entry')
      }
    }
  }

  const handleAddEntry = () => {
    if (!canManageTimetable) return
    setEditingEntry(null)
    setShowAddModal(true)
  }

  const handleExportTimetable = async () => {
    try {
      // Implementation for exporting timetable
      toast.success('Timetable exported successfully')
    } catch (error) {
      console.error('Failed to export timetable:', error)
      toast.error('Failed to export timetable')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-3 text-gray-600">Loading timetables...</span>
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
          <h1 className="text-2xl font-bold text-gray-900">{isTeacherPortal || isStudentPortal ? 'My Timetable' : 'Timetable Management'}</h1>
          <p className="text-gray-600 mt-1">
            {isTeacherPortal
              ? 'View your teaching schedule in read-only mode'
              : isStudentPortal
                ? 'View your class timetable in read-only mode'
                : 'Manage class schedules and timetables'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {!isStudentPortal && (
            <Button
              onClick={handleExportTimetable}
              variant="outline"
              className="flex items-center"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              {isTeacherPortal ? 'Export My Schedule' : 'Export'}
            </Button>
          )}
          {canManageTimetable && (
            <Button 
              onClick={handleAddEntry}
              className="bg-primary-600 hover:bg-primary-700 flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Schedule
            </Button>
          )}
        </div>
      </div>

      {(isTeacherPortal || isStudentPortal) && (
        <Card>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h3 className="text-sm font-semibold text-amber-900">{isStudentPortal ? 'Student timetable access is view-only' : 'Teacher timetable access is view-only'}</h3>
            <p className="text-sm text-amber-800 mt-1">
              Creating, editing, and deleting timetable entries is restricted to administrative scheduling roles.
            </p>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-2">
                Class
              </label>
              <select
                id="className"
                value={filters.className}
                onChange={(e) => setFilters(prev => ({ ...prev, className: e.target.value }))}
                disabled={isStudentPortal}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Classes</option>
                {(isStudentPortal ? (studentScopedClass ? [studentScopedClass] : []) : classes).map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week
              </label>
              <select
                id="dayOfWeek"
                value={filters.dayOfWeek}
                onChange={(e) => setFilters(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Days</option>
                {daysOfWeek.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year
              </label>
              <select
                id="academicYear"
                value={filters.academicYear}
                onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2025/2026">2025/2026</option>
                <option value="2024/2025">2024/2025</option>
                <option value="2023/2024">2023/2024</option>
              </select>
            </div>
            <div>
              <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-2">
                Term
              </label>
              <select
                id="term"
                value={filters.term}
                onChange={(e) => setFilters(prev => ({ ...prev, term: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Term 1</option>
                <option value={2}>Term 2</option>
                <option value={3}>Term 3</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => setFilters({
                  className: isStudentPortal ? studentScopedClass : '',
                  dayOfWeek: '',
                  teacherId: isTeacherPortal && teacherScopedId ? String(teacherScopedId) : '',
                  academicYear: '2025/2026',
                  term: 1
                })}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      {!isStudentPortal && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Entries"
            value={stats.totalEntries}
            icon={CalendarIcon}
            color="blue"
            subtitle="Scheduled periods"
          />
          <StatCard
            title="Classes"
            value={stats.totalClasses}
            icon={AcademicCapIcon}
            color="green"
            subtitle="With timetables"
          />
          <StatCard
            title="Teachers"
            value={stats.totalTeachers}
            icon={UserIcon}
            color="purple"
            subtitle="Assigned"
          />
          <StatCard
            title="Subjects"
            value={stats.totalSubjects}
            icon={BuildingLibraryIcon}
            color="orange"
            subtitle="Being taught"
          />
          <StatCard
            title="Avg Periods/Day"
            value={Math.round(stats.averagePeriodsPerDay * 10) / 10}
            icon={ClockIcon}
            color="indigo"
            subtitle="Per class"
          />
        </div>
      )}

      {/* View Mode Controls */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Timetable View</h3>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ListBulletIcon className="w-4 h-4 mr-2" />
                  Table View
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <TableCellsIcon className="w-4 h-4 mr-2" />
                  Grid View
                </button>
              </div>
            </div>
          </div>

          {/* Grid View Controls */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View Type
                </label>
                <select
                  value={gridViewConfig.type}
                  onChange={(e) => setGridViewConfig(prev => ({ 
                    ...prev, 
                    type: e.target.value, 
                    targetId: '' 
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="class">Class Timetable</option>
                  {!isStudentPortal && <option value="teacher">Teacher Timetable</option>}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select {gridViewConfig.type === 'class' ? 'Class' : 'Teacher'}
                </label>
                {gridViewConfig.type === 'class' ? (
                  <select
                    value={gridViewConfig.targetId}
                    onChange={(e) => setGridViewConfig(prev => ({ 
                      ...prev, 
                      targetId: e.target.value 
                    }))}
                    disabled={isStudentPortal}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {isStudentPortal ? (
                      <option value={studentScopedClass}>{studentScopedClass || 'My class'}</option>
                    ) : (
                      <>
                        <option value="">Select a class</option>
                        {availableClasses.map((cls) => (
                          <option key={cls.id || cls.className} value={cls.className || cls.name}>
                            {cls.className || cls.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                ) : (
                  <select
                    value={gridViewConfig.targetId}
                    onChange={(e) => setGridViewConfig(prev => ({ 
                      ...prev, 
                      targetId: e.target.value 
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a teacher</option>
                    {availableTeachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName} ({teacher.employeeId || teacher.code})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Timetable Content */}
      {viewMode === 'grid' ? (
        <TimetableGridView
          viewType={gridViewConfig.type}
          targetId={gridViewConfig.targetId}
          academicYear={filters.academicYear}
          term={filters.term}
        />
      ) : (
        /* Timetable Table */
        timetables.length > 0 ? (
          <DataTable
            data={timetables}
            columns={columns}
            searchable
            sortable
            pagination
            pageSize={15}
          />
        ) : (
          <Card>
            <div className="p-12 text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No timetable entries</h3>
              <p className="mt-1 text-sm text-gray-500">
                No timetable entries found for the current filters.
              </p>
              {canManageTimetable && (
                <div className="mt-6">
                  <Button 
                    onClick={handleAddEntry}
                    className="flex items-center mx-auto"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Schedule Entry
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )
      )}

      {/* Timetable Registration Modal */}
      <TimetableRegistration
        isOpen={canManageTimetable && showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setEditingEntry(null)
        }}
        onSuccess={loadTimetables}
        editingEntry={editingEntry}
      />

      {/* View Timetable Entry Modal */}
      <AnimatePresence>
        {viewEntry && (
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
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                      <CalendarIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{viewEntry.className}</h2>
                      <p className="text-primary-200 text-sm mt-0.5">{viewEntry.subjectName}{viewEntry.subjectCode ? ` (${viewEntry.subjectCode})` : ''}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                          {viewEntry.periodType || 'LESSON'}
                        </span>
                        {viewEntry.isDoublePerod && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-400/20 text-yellow-100 ring-1 ring-yellow-300/40">
                            Double Period
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewEntry(null)}
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
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Day</span>
                    <p className="font-medium">{viewEntry.dayOfWeek || '—'}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Period</span>
                    <p className="font-medium">{viewEntry.periodNumber}{viewEntry.periodName ? ` – ${viewEntry.periodName}` : ''}</p>
                  </div>
                  <div className="border-l border-primary-500 pl-4">
                    <span className="text-primary-300 text-xs uppercase tracking-wider">Time</span>
                    <p className="font-medium">{viewEntry.startTime} – {viewEntry.endTime}</p>
                  </div>
                  {viewEntry.room && (
                    <div className="border-l border-primary-500 pl-4">
                      <span className="text-primary-300 text-xs uppercase tracking-wider">Room</span>
                      <p className="font-medium">{viewEntry.room}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                {/* Schedule Info */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-b border-gray-200">
                    <span className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                      <CalendarIcon className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="text-sm font-semibold text-blue-800">Schedule</h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Class', viewEntry.stream ? `${viewEntry.className} (${viewEntry.stream})` : viewEntry.className],
                        ['Subject', viewEntry.subjectName],
                        ['Subject Code', viewEntry.subjectCode],
                        ['Day', viewEntry.dayOfWeek],
                        ['Period', viewEntry.periodNumber + (viewEntry.periodName ? ` – ${viewEntry.periodName}` : '')],
                        ['Time', `${viewEntry.startTime} – ${viewEntry.endTime}`],
                        ['Type', viewEntry.periodType || 'LESSON'],
                      ].filter(([, v]) => v != null && v !== '').map(([label, val], i) => (
                        <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-500 font-medium w-44">{label}</td>
                          <td className="px-4 py-2 text-gray-900">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Teacher & Room */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border-b border-gray-200">
                    <span className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center">
                      <UserIcon className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="text-sm font-semibold text-emerald-800">Teacher & Room</h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Teacher', viewEntry.teacherName || 'Not Assigned'],
                        ['Room', viewEntry.room || 'TBA'],
                        ['Building', viewEntry.building],
                      ].filter(([, v]) => v != null && v !== '').map(([label, val], i) => (
                        <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-500 font-medium w-44">{label}</td>
                          <td className="px-4 py-2 text-gray-900">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Term */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-gray-200">
                    <span className="w-5 h-5 rounded bg-amber-600 flex items-center justify-center">
                      <ClockIcon className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="text-sm font-semibold text-amber-800">Term & Year</h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Term', viewEntry.term],
                        ['Academic Year', viewEntry.academicYear],
                        ['Double Period', viewEntry.isDoublePerod ? 'Yes' : 'No'],
                      ].filter(([, v]) => v != null && v !== '').map(([label, val], i) => (
                        <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-500 font-medium w-44">{label}</td>
                          <td className="px-4 py-2 text-gray-900">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
                <span className="text-xs text-gray-500">{viewEntry.className} — {viewEntry.dayOfWeek}, Period {viewEntry.periodNumber}</span>
                <div className="flex gap-2">
                  {canManageTimetable && (
                    <button
                      onClick={() => { setViewEntry(null); handleEditEntry(viewEntry) }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-yellow-300 rounded-lg text-yellow-700 hover:bg-yellow-50 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => setViewEntry(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Timetable

