import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CalendarDaysIcon, 
  PlusIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'

const Events = () => {
  const [filter, setFilter] = useState('upcoming')

  const mockEvents = [
    {
      id: 1,
      title: 'Parent-Teacher Conference',
      date: '2026-03-20',
      time: '09:00 AM',
      location: 'School Auditorium',
      type: 'Meeting',
      attendees: 150,
      status: 'Scheduled'
    },
    {
      id: 2,
      title: 'Science Fair',
      date: '2026-03-25',
      time: '10:00 AM', 
      location: 'Science Lab',
      type: 'Academic',
      attendees: 200,
      status: 'Scheduled'
    },
    {
      id: 3,
      title: 'Sports Day',
      date: '2026-04-05',
      time: '08:00 AM',
      location: 'Sports Ground',
      type: 'Sports',
      attendees: 500,
      status: 'Planning'
    }
  ]

  const stats = [
    { title: 'Total Events', value: '24', change: '+6', trend: 'up' },
    { title: 'This Month', value: '8', change: '+2', trend: 'up' },
    { title: 'Attendance Rate', value: '87%', change: '+3%', trend: 'up' },
    { title: 'Avg Participants', value: '156', change: '+12', trend: 'up' }
  ]

  const columns = [
    { key: 'title', header: 'Event' },
    { key: 'date', header: 'Date' },
    { key: 'time', header: 'Time' },
    { key: 'location', header: 'Location' },
    { key: 'type', header: 'Type' },
    { key: 'attendees', header: 'Expected Attendees' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Scheduled' ? 'bg-green-100 text-green-800' :
          value === 'Planning' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: 'actions', 
      header: 'Actions',
      render: () => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Edit</Button>
          <Button size="sm" variant="ghost">View</Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events & Calendar</h1>
          <p className="text-gray-600">Manage school events, meetings, and activities</p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Events</h3>
          <DataTable
            data={mockEvents}
            columns={columns}
            searchPlaceholder="Search events..."
          />
        </div>
      </Card>
    </div>
  )
}

export default Events