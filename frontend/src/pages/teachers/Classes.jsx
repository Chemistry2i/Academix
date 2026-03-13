import React from 'react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Card from '../../components/common/Card'
import DataTable from '../../components/common/DataTable'
import StatCard from '../../components/common/StatCard'
import {
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { classService } from '../../services/classService'
import { studentService } from '../../services/studentService'
import { teacherPortalService } from '../../services/teacherPortalService'

const TeacherClasses = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [myClasses, setMyClasses] = useState([])
  const [classRegisters, setClassRegisters] = useState({})
  const [selectedRegisterClass, setSelectedRegisterClass] = useState(null)

  useEffect(() => {
    const loadTeacherClasses = async () => {
      setLoading(true)
      try {
        const [allClassesPayload, studentPayload] = await Promise.all([
          classService.getClasses(),
          studentService.getStudents(true).catch(() => ({ students: [] }))
        ])

        const allClasses = normalizeArray(allClassesPayload)
        const allStudents = normalizeArray(studentPayload, ['students', 'data'])
        const scope = await teacherPortalService.getTeacherContext(user, { classes: allClasses })
        const classList = scope.assignedClasses || []

        setMyClasses(classList)
        setClassRegisters(buildClassRegisters(classList, allStudents))
        setSelectedRegisterClass((current) => {
          if (current && classList.some((item) => getClassKey(item) === getClassKey(current))) {
            return current
          }
          return classList[0] || null
        })
      } catch (error) {
        console.error('Failed to load teacher classes:', error)
        setMyClasses([])
        setClassRegisters({})
        setSelectedRegisterClass(null)
      } finally {
        setLoading(false)
      }
    }

    loadTeacherClasses()
  }, [user?.email])

  const normalizeArray = (payload, keys = []) => {
    if (Array.isArray(payload)) return payload
    if (!payload || typeof payload !== 'object') return []

    for (const key of keys) {
      if (Array.isArray(payload[key])) return payload[key]
    }

    const firstArray = Object.values(payload).find((value) => Array.isArray(value))
    return firstArray || []
  }

  const normalizeString = (value) => String(value || '').trim().toLowerCase()

  const getClassName = (row) => row?.name || row?.className || ''

  const getClassKey = (row) => String(row?.id || row?.classId || getClassName(row) || '')

  const getStudentClassName = (student) => {
    return student?.schoolClass?.name || student?.currentClass || student?.className || ''
  }

  const buildClassRegisters = (classList, students) => {
    return classList.reduce((acc, classItem) => {
      const classKey = getClassKey(classItem)
      const className = getClassName(classItem)
      const register = students
        .filter((student) => normalizeString(getStudentClassName(student)) === normalizeString(className))
        .sort((left, right) => {
          const leftName = `${left?.firstName || ''} ${left?.lastName || ''}`.trim()
          const rightName = `${right?.firstName || ''} ${right?.lastName || ''}`.trim()
          return leftName.localeCompare(rightName)
        })

      acc[classKey] = register
      return acc
    }, {})
  }

  const columns = [
    {
      key: 'name',
      header: 'Class Name',
      sortable: true,
      render: (_, row) => row.name || row.className || 'N/A'
    },
    {
      key: 'subject',
      header: 'Subject',
      sortable: true,
      render: (_, row) => row.subject || row.mainSubject || 'N/A'
    },
    {
      key: 'level',
      header: 'Level',
      sortable: true,
      render: (_, row) => row.level || (row.formLevel ? `Senior ${row.formLevel}` : 'N/A')
    },
    {
      key: 'students',
      header: 'Students',
      sortable: true,
      render: (_, row) => Number(row.students || row.currentCount || row.studentCount || 0)
    },
    {
      key: 'schedule',
      header: 'Schedule',
      render: (_, row) => row.schedule || row.periodLabel || 'Not assigned'
    },
    {
      key: 'room',
      header: 'Room',
      sortable: true,
      render: (_, row) => row.room || row.classroom || 'N/A'
    },
    {
      key: 'register',
      header: 'Register',
      sortable: false,
      render: (_, row) => {
        const classKey = getClassKey(row)
        const count = classRegisters[classKey]?.length || 0
        const isSelected = getClassKey(selectedRegisterClass) === classKey
        return (
          <button
            onClick={() => setSelectedRegisterClass(row)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isSelected
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ClipboardDocumentListIcon className="w-4 h-4" />
            {count} students
          </button>
        )
      }
    },
    { 
      key: 'avgGrade', 
      header: 'Avg Grade', 
      sortable: true,
      render: (_, row) => {
        const value = Number(row.avgGrade || row.averageGrade || row.classAverage || 0)
        return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value >= 85 ? 'bg-green-100 text-green-800' :
          value >= 75 ? 'bg-blue-100 text-blue-800' :
          value >= 65 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}%
        </span>
      )
      }
    },
    { 
      key: 'attendance', 
      header: 'Attendance', 
      sortable: true,
      render: (_, row) => {
        const value = Number(row.attendance || row.averageAttendance || 0)
        return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value >= 95 ? 'bg-green-100 text-green-800' :
          value >= 90 ? 'bg-blue-100 text-blue-800' :
          value >= 85 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}%
        </span>
      )
      }
    }
  ]

  const totalStudents = myClasses.reduce(
    (sum, cls) => sum + Number(cls.students || cls.currentCount || cls.studentCount || 0),
    0
  )
  const gradeValues = myClasses
    .map((cls) => Number(cls.avgGrade || cls.averageGrade || cls.classAverage || 0))
    .filter((value) => value > 0)
  const attendanceValues = myClasses
    .map((cls) => Number(cls.attendance || cls.averageAttendance || 0))
    .filter((value) => value > 0)

  const avgGrade = gradeValues.length
    ? Math.round(gradeValues.reduce((sum, value) => sum + value, 0) / gradeValues.length)
    : 0
  const avgAttendance = attendanceValues.length
    ? Math.round(attendanceValues.reduce((sum, value) => sum + value, 0) / attendanceValues.length)
    : 0

  const selectedClassName = getClassName(selectedRegisterClass)
  const selectedClassKey = getClassKey(selectedRegisterClass)
  const selectedRegister = classRegisters[selectedClassKey] || []

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
            <p className="text-gray-600 mt-1">
              Manage and monitor your teaching assignments
            </p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard
            title="Total Students"
            value={loading ? '...' : totalStudents.toLocaleString()}
            change={loading ? '' : `Across ${myClasses.length} classes`}
            changeType="positive"
            icon={UserGroupIcon}
            color="blue"
          />
          <StatCard
            title="Average Grade"
            value={loading ? '...' : `${avgGrade}%`}
            change={loading ? '' : 'Live from class records'}
            changeType="positive"
            icon={ChartBarIcon}
            color="green"
          />
          <StatCard
            title="Average Attendance"
            value={loading ? '...' : `${avgAttendance}%`}
            change={loading ? '' : 'Current attendance trend'}
            changeType="positive"
            icon={AcademicCapIcon}
            color="purple"
          />
        </div>

        <Card>
          <DataTable
            data={myClasses}
            columns={columns}
            searchable
          />
        </Card>

        <Card className="mt-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Class Register</h3>
                <p className="text-sm text-gray-500">
                  {selectedClassName
                    ? `${selectedClassName} roster with contact and guardian details.`
                    : 'Select a class above to open its register.'}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {selectedClassName ? `${selectedRegister.length} students` : 'No class selected'}
              </div>
            </div>

            {selectedClassName ? (
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Residence</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guardian</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {selectedRegister.map((student) => {
                      const studentName = `${student?.firstName || ''} ${student?.lastName || ''}`.trim() || student?.fullName || 'Student'
                      return (
                        <tr key={String(student?.id || student?.studentId || studentName)}>
                          <td className="px-4 py-3 text-sm text-gray-900">{studentName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-mono">{student?.studentId || student?.studentNumber || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{student?.gender || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{student?.residenceStatus || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{student?.guardianName || student?.parentName || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{student?.guardianPhone || student?.parentPhone || student?.phone || '-'}</td>
                        </tr>
                      )
                    })}
                    {!selectedRegister.length && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                          No students found for this class register.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center text-sm text-gray-500 border border-dashed border-gray-300 rounded-xl">
                No assigned class found yet for this teacher.
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default TeacherClasses