import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardDocumentCheckIcon, UserGroupIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import StatCard from '../components/common/StatCard'
import Button from '../components/common/Button'

const Attendance = () => {
  const [attendanceStats] = useState({
    present: 1156,
    absent: 91,
    late: 12,
    attendanceRate: 92.7
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Track and manage student attendance</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" />
          Take Attendance
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Present Today"
          value={attendanceStats.present}
          change="+5%"
          changeType="positive"
          icon={UserGroupIcon}
          color="green"
        />
        <StatCard
          title="Absent Today"
          value={attendanceStats.absent}
          change="-2%"
          changeType="positive"
          icon={UserGroupIcon}
          color="red"
        />
        <StatCard
          title="Late Arrivals"
          value={attendanceStats.late}
          change="-8%"
          changeType="positive"
          icon={CalendarDaysIcon}
          color="yellow"
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceStats.attendanceRate}%`}
          change="+1.2%"
          changeType="positive"
          icon={ClipboardDocumentCheckIcon}
          color="blue"
        />
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h3>
          <div className="text-center py-8">
            <ClipboardDocumentCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Attendance tracking interface coming soon!</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default Attendance