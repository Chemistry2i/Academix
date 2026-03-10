import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  UsersIcon, 
  PlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'

const Staff = () => {
  const [filter, setFilter] = useState('all')

  const mockStaff = [
    {
      id: 1,
      name: 'Sarah Wilson',
      staffId: 'STF001',
      department: 'Administration',
      position: 'Secretary',
      email: 'sarah.wilson@academix.edu',
      phone: '+1 234-567-8901',
      joinDate: '2024-09-15',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Michael Chen',
      staffId: 'STF002', 
      department: 'IT Support',
      position: 'Technical Assistant',
      email: 'michael.chen@academix.edu',
      phone: '+1 234-567-8902',
      joinDate: '2025-01-20',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Rebecca Martinez',
      staffId: 'STF003',
      department: 'Maintenance',
      position: 'Custodian',
      email: 'rebecca.martinez@academix.edu',
      phone: '+1 234-567-8903',
      joinDate: '2023-11-10',
      status: 'Active'
    },
    {
      id: 4,
      name: 'David Thompson',
      staffId: 'STF004',
      department: 'Security',
      position: 'Security Guard',
      email: 'david.thompson@academix.edu',
      phone: '+1 234-567-8904',
      joinDate: '2024-03-05',
      status: 'On Leave'
    }
  ]

  const stats = [
    { title: 'Total Staff', value: '48', change: '+3', trend: 'up' },
    { title: 'Active Staff', value: '45', change: '+2', trend: 'up' },
    { title: 'On Leave', value: '3', change: '+1', trend: 'up' },
    { title: 'Departments', value: '8', change: '0', trend: 'neutral' }
  ]

  const columns = [
    { 
      key: 'name', 
      header: 'Staff Member',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{row.staffId}</p>
        </div>
      )
    },
    { key: 'department', header: 'Department' },
    { key: 'position', header: 'Position' },
    { 
      key: 'email', 
      header: 'Contact',
      render: (value, row) => (
        <div>
          <p className="text-sm text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{row.phone}</p>
        </div>
      )
    },
    { key: 'joinDate', header: 'Join Date' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Active' ? 'bg-green-100 text-green-800' :
          value === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
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
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage non-teaching staff members</p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Add Staff Member
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
            <h3 className="text-lg font-semibold text-gray-900">All Staff Members</h3>
            <div className="flex gap-2">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Staff</option>
                <option value="active">Active</option>
                <option value="leave">On Leave</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DataTable
            data={mockStaff}
            columns={columns}
            searchPlaceholder="Search staff members..."
          />
        </div>
      </Card>
    </div>
  )
}

export default Staff