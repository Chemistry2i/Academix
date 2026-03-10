import React from 'react'
import { motion } from 'framer-motion'
import Card from '../../components/common/Card'
import DataTable from '../../components/common/DataTable'

const StudentCourses = () => {
  const myCourses = [
    {
      id: 1,
      name: 'Mathematics',
      code: 'MATH101',
      teacher: 'Mr. Anderson',
      schedule: 'Mon, Wed, Fri - 08:00 AM',
      room: 'Room 101',
      credits: 4,
      currentGrade: 'A-'
    },
    {
      id: 2,
      name: 'English Literature',
      code: 'ENG201',
      teacher: 'Ms. Johnson',
      schedule: 'Tue, Thu - 09:00 AM',
      room: 'Room 205',
      credits: 3,
      currentGrade: 'B+'
    },
    {
      id: 3,
      name: 'Physics',
      code: 'PHY301',
      teacher: 'Dr. Smith',
      schedule: 'Mon, Wed - 10:30 AM',
      room: 'Lab 1',
      credits: 4,
      currentGrade: 'B'
    },
    {
      id: 4,
      name: 'History',
      code: 'HIS101',
      teacher: 'Mrs. Brown',
      schedule: 'Tue, Thu - 13:00 PM',
      room: 'Room 310',
      credits: 3,
      currentGrade: 'A'
    }
  ]

  const columns = [
    { key: 'code', header: 'Course Code', sortable: true },
    { key: 'name', header: 'Course Name', sortable: true },
    { key: 'teacher', header: 'Teacher', sortable: true },
    { key: 'schedule', header: 'Schedule', sortable: false },
    { key: 'room', header: 'Room', sortable: false },
    { key: 'credits', header: 'Credits', sortable: true },
    { 
      key: 'currentGrade', 
      header: 'Current Grade', 
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value.startsWith('A') ? 'bg-green-100 text-green-800' :
          value.startsWith('B') ? 'bg-blue-100 text-blue-800' :
          value.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 mt-1">
              View your enrolled courses and current performance
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {myCourses.length} Courses Enrolled
            </span>
          </div>
        </div>

        <Card>
          <DataTable
            data={myCourses}
            columns={columns}
            searchable
            searchPlaceholder="Search courses..."
          />
        </Card>
      </motion.div>
    </div>
  )
}

export default StudentCourses