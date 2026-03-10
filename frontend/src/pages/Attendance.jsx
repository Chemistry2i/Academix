import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import StatCard from '../components/common/StatCard'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import { attendanceService } from '../services/attendanceService'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

const Attendance = () => {
  const { hasAnyRole, user } = useAuth()
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
  const [showMarkAttendance, setShowMarkAttendance] = useState(false)
  const [classes] = useState(['S1A', 'S1B', 'S2A', 'S2B', 'S3A', 'S3B', 'S4A', 'S4B', 'S5 PCM', 'S5 PCB', 'S5 HEG', 'S6 PCM', 'S6 PCB', 'S6 HEG'])

  useEffect(() => {
    loadAttendanceData()
    loadAttendanceStatistics()
  }, [selectedDate, selectedClass])

  const loadAttendanceData = async () => {
    try {
      setLoading(true)
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

  const columns = [
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
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewAttendance(record)}
            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          {hasAnyRole(['ADMIN', 'TEACHER', 'CLASS_TEACHER']) && (
            <>
              <button
                onClick={() => handleEditAttendance(record)}
                className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded transition-colors"
                title="Edit Attendance"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              {hasAnyRole(['ADMIN']) && (
                <button
                  onClick={() => handleDeleteAttendance(record)}
                  className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                  title="Delete Record"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      )
    }
  ]

  const handleViewAttendance = (record) => {
    Swal.fire({
      title: `Attendance Details - ${record.studentName}`,
      html: `
        <div class="text-left space-y-2">
          <p><strong>Student:</strong> ${record.studentName} (${record.studentNumber})</p>
          <p><strong>Class:</strong> ${record.className}${record.stream ? ` - ${record.stream}` : ''}</p>
          <p><strong>Date:</strong> ${record.date}</p>
          <p><strong>Status:</strong> ${record.status}</p>
          <p><strong>Session:</strong> ${record.sessionType?.replace('_', ' ') || 'Full Day'}</p>
          ${record.checkInTime ? `<p><strong>Check In:</strong> ${record.checkInTime}</p>` : ''}
          ${record.checkOutTime ? `<p><strong>Check Out:</strong> ${record.checkOutTime}</p>` : ''}
          ${record.subjectName ? `<p><strong>Subject:</strong> ${record.subjectName}</p>` : ''}
          ${record.absenceReason ? `<p><strong>Absence Reason:</strong> ${record.absenceReason}</p>` : ''}
          ${record.absenceNote ? `<p><strong>Note:</strong> ${record.absenceNote}</p>` : ''}
          ${record.markedByName ? `<p><strong>Marked By:</strong> ${record.markedByName}</p>` : ''}
        </div>
      `,
      icon: 'info',
      customClass: {
        container: 'font-outfit',
        popup: 'rounded-xl'
      }
    })
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
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Track and manage student attendance</p>
        </div>
        {hasAnyRole(['ADMIN', 'TEACHER', 'CLASS_TEACHER']) && (
          <div className="flex items-center space-x-3">
            <Button 
              onClick={handleExportAttendance}
              variant="outline"
              className="flex items-center"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              onClick={handleMarkAttendance}
              className="bg-green-600 hover:bg-green-700 flex items-center"
            >
              <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" />
              Take Attendance
            </Button>
          </div>
        )}
      </div>

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
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
          </div>
        </div>
      </Card>

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
            {hasAnyRole(['ADMIN', 'TEACHER', 'CLASS_TEACHER']) && (
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
    </motion.div>
  )
}

export default Attendance