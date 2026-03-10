import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BuildingOffice2Icon, 
  PlusIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'

const Departments = () => {
  const [filter, setFilter] = useState('all')

  const mockDepartments = [
    {
      id: 1,
      name: 'Mathematics',
      head: 'Dr. Robert Johnson',
      teachers: 8,
      subjects: 12,
      students: 450,
      status: 'Active',
      established: '2015'
    },
    {
      id: 2,
      name: 'Science',
      head: 'Prof. Maria Garcia',
      teachers: 12,
      subjects: 18,
      students: 380,
      status: 'Active',
      established: '2015'
    },
    {
      id: 3,
      name: 'English Literature',
      head: 'Dr. James Smith',
      teachers: 6,
      subjects: 8,
      students: 320,
      status: 'Active',
      established: '2015'
    },
    {
      id: 4,
      name: 'Arts & Music',
      head: 'Ms. Sarah Williams',
      teachers: 4,
      subjects: 6,
      students: 200,
      status: 'Active',
      established: '2018'
    },
    {
      id: 5,
      name: 'Physical Education',
      head: 'Coach Mike Brown',
      teachers: 3,
      subjects: 4,
      students: 500,
      status: 'Active',
      established: '2015'
    }
  ]

  const stats = [
    { title: 'Total Departments', value: '12', change: '+1', trend: 'up' },
    { title: 'Department Heads', value: '12', change: '0', trend: 'neutral' },
    { title: 'Total Teachers', value: '78', change: '+5', trend: 'up' },
    { title: 'Subjects Offered', value: '145', change: '+8', trend: 'up' }
  ]

  const columns = [
    { key: 'name', header: 'Department' },
    { 
      key: 'head', 
      header: 'Department Head',
      render: (value) => (
        <p className="font-medium text-gray-900">{value}</p>
      )
    },
    { 
      key: 'teachers', 
      header: 'Teachers',
      render: (value) => (
        <div className="flex items-center gap-1">
          <UserGroupIcon className="h-4 w-4 text-gray-500" />
          <span>{value}</span>
        </div>
      )
    },
    { 
      key: 'subjects', 
      header: 'Subjects',
      render: (value) => (
        <div className="flex items-center gap-1">
          <BookOpenIcon className="h-4 w-4 text-gray-500" />
          <span>{value}</span>
        </div>
      )
    },
    { 
      key: 'students', 
      header: 'Students',
      render: (value) => (
        <div className="flex items-center gap-1">
          <AcademicCapIcon className="h-4 w-4 text-gray-500" />
          <span>{value}</span>
        </div>
      )
    },
    { key: 'established', header: 'Established' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Active' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
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
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600">Manage academic departments and their structure</p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Create Department
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">All Departments</h3>
            <div className="flex gap-2">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Departments</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DataTable
            data={mockDepartments}
            columns={columns}
            searchPlaceholder="Search departments..."
          />
        </div>
      </Card>
    </div>
  )
}

export default Departments