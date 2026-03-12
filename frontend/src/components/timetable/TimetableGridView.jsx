import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  UserIcon, 
  AcademicCapIcon, 
  ClockIcon, 
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../common/LoadingSpinner'
import { timetableService } from '../../services/timetableService'
import { teacherService } from '../../services/teacherService'
import toast from 'react-hot-toast'

const TimetableGridView = ({ 
  viewType = 'class', 
  targetId = null, 
  academicYear = '2025/2026', 
  term = 1 
}) => {
  const [timetableData, setTimetableData] = useState({})
  const [loading, setLoading] = useState(true)
  const [viewInfo, setViewInfo] = useState(null)

  const daysOfWeek = [
    'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'
  ]

  const timeSlots = [
    { period: 1, time: '08:00 - 08:40' },
    { period: 2, time: '08:40 - 09:20' },
    { period: 3, time: '09:20 - 10:00' },
    { period: 4, time: '10:30 - 11:10' }, // After break
    { period: 5, time: '11:10 - 11:50' },
    { period: 6, time: '11:50 - 12:30' },
    { period: 7, time: '14:00 - 14:40' }, // After lunch
    { period: 8, time: '14:40 - 15:20' },
    { period: 9, time: '15:20 - 16:00' },
    { period: 10, time: '16:00 - 16:40' }
  ]

  useEffect(() => {
    loadTimetableData()
  }, [viewType, targetId, academicYear, term])

  const loadTimetableData = async () => {
    if (!targetId) {
      setTimetableData({})
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      let data = []
      let info = null

      if (viewType === 'class') {
        data = await timetableService.getClassTimetable(targetId, term, academicYear)
        info = { type: 'Class', name: targetId }
      } else if (viewType === 'teacher') {
        data = await timetableService.getTeacherTimetable(targetId, term, academicYear)
        try {
          const teacher = await teacherService.getTeacherById(targetId)
          info = { 
            type: 'Teacher', 
            name: `${teacher.firstName} ${teacher.lastName}`,
            code: teacher.employeeId || teacher.code
          }
        } catch (err) {
          info = { type: 'Teacher', name: `Teacher ID: ${targetId}` }
        }
      }

      // Organize data by day and period
      const organized = {}
      daysOfWeek.forEach(day => {
        organized[day] = {}
        timeSlots.forEach(slot => {
          organized[day][slot.period] = null
        })
      })

      data.forEach(entry => {
        if (entry.dayOfWeek && entry.periodNumber) {
          organized[entry.dayOfWeek][entry.periodNumber] = entry
        }
      })

      setTimetableData(organized)
      setViewInfo(info)
    } catch (error) {
      console.error('Failed to load timetable data:', error)
      toast.error('Failed to load timetable data')
      setTimetableData({})
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (startTime, endTime, periodNumber) => {
    if (startTime && endTime) {
      return `${startTime} - ${endTime}`
    }
    return timeSlots.find(slot => slot.period === periodNumber)?.time || 'Time TBA'
  }

  const getSubjectDisplayName = (entry) => {
    return entry.subjectName || entry.subjectCode || 'Unknown Subject'
  }

  const getTeacherDisplayName = (entry) => {
    if (entry.teacherName) return entry.teacherName
    return 'Unassigned'
  }

  const getRoomDisplayName = (entry) => {
    return entry.room || 'TBA'
  }

  const renderTimetableCell = (dayOfWeek, period) => {
    const entry = timetableData[dayOfWeek]?.[period]
    const timeSlot = timeSlots.find(slot => slot.period === period)

    if (!entry) {
      return (
        <td key={`${dayOfWeek}-${period}`} className="p-2 border border-gray-200 bg-gray-50 text-center">
          <div className="text-xs text-gray-400">
            {timeSlot?.time}
          </div>
          <div className="text-sm text-gray-400 mt-1">Free</div>
        </td>
      )
    }

    const subjectColors = {
      'Mathematics': 'bg-blue-100 border-blue-300 text-blue-800',
      'English': 'bg-green-100 border-green-300 text-green-800',
      'Physics': 'bg-purple-100 border-purple-300 text-purple-800',
      'Chemistry': 'bg-orange-100 border-orange-300 text-orange-800',
      'Biology': 'bg-emerald-100 border-emerald-300 text-emerald-800',
      'History': 'bg-amber-100 border-amber-300 text-amber-800',
      'Geography': 'bg-cyan-100 border-cyan-300 text-cyan-800',
      'default': 'bg-gray-100 border-gray-300 text-gray-800'
    }

    const colorClass = subjectColors[entry.subjectName] || subjectColors.default

    return (
      <td key={`${dayOfWeek}-${period}`} className="p-1 border border-gray-200">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${colorClass} rounded-lg p-2 border-2 min-h-[80px] flex flex-col justify-between cursor-pointer transition-all duration-200 hover:shadow-md`}
        >
          <div>
            <div className="text-xs font-medium mb-1">
              {formatTime(entry.startTime, entry.endTime, entry.periodNumber)}
            </div>
            <div className="font-bold text-sm mb-1">
              {getSubjectDisplayName(entry)}
            </div>
          </div>
          
          <div className="text-xs space-y-1">
            {viewType !== 'teacher' && (
              <div className="flex items-center">
                <UserIcon className="w-3 h-3 mr-1" />
                {getTeacherDisplayName(entry)}
              </div>
            )}
            
            {viewType !== 'class' && entry.className && (
              <div className="flex items-center">
                <AcademicCapIcon className="w-3 h-3 mr-1" />
                {entry.className}
              </div>
            )}
            
            <div className="flex items-center">
              <BuildingStorefrontIcon className="w-3 h-3 mr-1" />
              {getRoomDisplayName(entry)}
            </div>
            
            {entry.isDoublePeriod && (
              <div className="bg-yellow-200 text-yellow-800 px-1 rounded text-xs">
                Double Period
              </div>
            )}
          </div>
        </motion.div>
      </td>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
        <span className="ml-3 text-gray-600">Loading timetable...</span>
      </div>
    )
  }

  if (!targetId) {
    return (
      <div className="text-center py-12">
        <CalendarDaysIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Select a {viewType} to view timetable</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-primary-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {viewType === 'class' ? (
              <AcademicCapIcon className="w-8 h-8" />
            ) : (
              <UserIcon className="w-8 h-8" />
            )}
            <div>
              <h2 className="text-2xl font-bold">
                {viewInfo?.name || `${viewType.charAt(0).toUpperCase() + viewType.slice(1)} Timetable`}
              </h2>
              {viewInfo?.code && (
                <p className="text-primary-200">Code: {viewInfo.code}</p>
              )}
              <p className="text-primary-200">
                Academic Year {academicYear} - Term {term}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-primary-200">Total Periods</div>
            <div className="text-2xl font-bold">
              {Object.values(timetableData).flat().filter(Boolean).length}
            </div>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left font-semibold text-gray-700 border border-gray-200 w-20">
                Period
              </th>
              {daysOfWeek.map(day => (
                <th key={day} className="p-3 text-center font-semibold text-gray-700 border border-gray-200">
                  <div className="flex flex-col items-center">
                    <span>{day.charAt(0) + day.slice(1).toLowerCase()}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot.period}>
                <td className="p-2 border border-gray-200 bg-gray-50 text-center font-medium">
                  <div className="text-sm font-bold text-gray-700">{timeSlot.period}</div>
                  <div className="text-xs text-gray-500 mt-1">{timeSlot.time}</div>
                </td>
                {daysOfWeek.map(day => renderTimetableCell(day, timeSlot.period))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 border-t">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <UserIcon className="w-4 h-4 text-gray-600" />
            <span>Teacher</span>
          </div>
          <div className="flex items-center space-x-2">
            <AcademicCapIcon className="w-4 h-4 text-gray-600" />
            <span>Class</span>
          </div>
          <div className="flex items-center space-x-2">
            <BuildingStorefrontIcon className="w-4 h-4 text-gray-600" />
            <span>Room</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-200 rounded border border-yellow-300"></div>
            <span>Double Period</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimetableGridView