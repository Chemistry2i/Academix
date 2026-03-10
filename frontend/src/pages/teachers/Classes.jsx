import React from 'react'
import { motion } from 'framer-motion'
import Card from '../../components/common/Card'
import DataTable from '../../components/common/DataTable'
import StatCard from '../../components/common/StatCard'
import {
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const TeacherClasses = () => {
  const myClasses = [
    {
      id: 1,
      name: 'S.6A Mathematics',
      subject: 'Mathematics',
      level: 'Senior 6',
      section: 'A',
      students: 32,
      schedule: 'Mon, Wed, Fri - 08:00 AM',
      room: 'Room 101',
      avgGrade: 82,
      attendance: 95
    },
    {
      id: 2,
      name: 'S.5B Physics',
      subject: 'Physics',
      level: 'Senior 5',
      section: 'B',
      students: 28,
      schedule: 'Tue, Thu - 09:15 AM',
      room: 'Lab 1',
      avgGrade: 78,
      attendance: 92
    },
    {
      id: 3,
      name: 'S.6B Mathematics',
      subject: 'Mathematics',
      level: 'Senior 6',
      section: 'B',
      students: 30,
      schedule: 'Mon, Wed, Fri - 10:30 AM',
      room: 'Room 101',
      avgGrade: 85,
      attendance: 94
    },
    {
      id: 4,
      name: 'S.5A Physics',
      subject: 'Physics',
      level: 'Senior 5',
      section: 'A',
      students: 25,
      schedule: 'Tue, Thu - 13:00 PM',
      room: 'Lab 2',
      avgGrade: 79,
      attendance: 90
    },
    {
      id: 5,
      name: 'S.4A Mathematics',
      subject: 'Mathematics',
      level: 'Senior 4',
      section: 'A',
      students: 35,
      schedule: 'Mon, Wed, Fri - 14:00 PM',
      room: 'Room 205',
      avgGrade: 76,
      attendance: 88
    },
    {
      id: 6,
      name: 'S.4B Physics',
      subject: 'Physics',
      level: 'Senior 4',
      section: 'B',
      students: 33,
      schedule: 'Tue, Thu - 15:30 PM',
      room: 'Lab 3',
      avgGrade: 74,
      attendance: 87
    }
  ]

  const columns = [
    { key: 'name', header: 'Class Name', sortable: true },
    { key: 'subject', header: 'Subject', sortable: true },
    { key: 'level', header: 'Level', sortable: true },
    { key: 'students', header: 'Students', sortable: true },
    { key: 'schedule', header: 'Schedule' },
    { key: 'room', header: 'Room', sortable: true },
    { 
      key: 'avgGrade', 
      header: 'Avg Grade', 
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value >= 85 ? 'bg-green-100 text-green-800' :
          value >= 75 ? 'bg-blue-100 text-blue-800' :
          value >= 65 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}%
        </span>
      )
    },
    { 
      key: 'attendance', 
      header: 'Attendance', 
      sortable: true,
      render: (value) => (
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
  ]

  const totalStudents = myClasses.reduce((sum, cls) => sum + cls.students, 0)
  const avgGrade = Math.round(myClasses.reduce((sum, cls) => sum + cls.avgGrade, 0) / myClasses.length)
  const avgAttendance = Math.round(myClasses.reduce((sum, cls) => sum + cls.attendance, 0) / myClasses.length)

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
            value={totalStudents.toLocaleString()}
            change="+8"
            changeType="positive"
            icon={UserGroupIcon}
            color="blue"
          />
          <StatCard
            title="Average Grade"
            value={`${avgGrade}%`}
            change="+2%"
            changeType="positive"
            icon={ChartBarIcon}
            color="green"
          />
          <StatCard
            title="Average Attendance"
            value={`${avgAttendance}%`}
            change="+1%"
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
            searchPlaceholder="Search classes..."
          />
        </Card>
      </motion.div>
    </div>
  )
}

export default TeacherClasses