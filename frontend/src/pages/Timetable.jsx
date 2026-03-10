import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'

const Timetable = () => {
  const [timetables] = useState([
    {
      id: 1,
      class: 'S.6 Science',
      subject: 'Mathematics',
      teacher: 'Mrs. Johnson',
      day: 'Monday',
      time: '8:00 AM - 9:30 AM',
      room: 'Room 101'
    },
    {
      id: 2,
      class: 'S.5 Arts',
      subject: 'History',
      teacher: 'Mr. Smith',
      day: 'Monday',
      time: '10:00 AM - 11:30 AM',
      room: 'Room 205'
    },
    {
      id: 3,
      class: 'S.4',
      subject: 'Biology',
      teacher: 'Dr. Brown',
      day: 'Tuesday',
      time: '9:00 AM - 10:30 AM',
      room: 'Lab 1'
    }
  ])

  const columns = [
    { key: 'class', label: 'Class' },
    { key: 'subject', label: 'Subject' },
    { key: 'teacher', label: 'Teacher' },
    { key: 'day', label: 'Day' },
    { key: 'time', label: 'Time' },
    { key: 'room', label: 'Room' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable Management</h1>
          <p className="text-gray-600 mt-1">Manage class schedules and timetables</p>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <CalendarIcon className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Weekly Timetable</h3>
          </div>
          <DataTable
            data={timetables}
            columns={columns}
            searchable={true}
            pagination={true}
          />
        </div>
      </Card>
    </motion.div>
  )
}

export default Timetable