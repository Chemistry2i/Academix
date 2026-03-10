import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  HeartIcon, 
  PlusIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'

const HealthRecords = () => {
  const [filter, setFilter] = useState('all')
  const [gradeFilter, setGradeFilter] = useState('all')

  const mockHealthRecords = [
    {
      id: 1,
      studentName: 'Alice Johnson',
      studentId: 'STU001',
      grade: 'Grade 10A',
      bloodType: 'O+',
      allergies: ['Peanuts', 'Shellfish'],
      medications: ['Inhaler (Asthma)'],
      emergencyContact: 'John Johnson - +1 234-567-8901',
      lastCheckup: '2026-02-15',
      vaccinations: 'Up to date',
      status: 'Active'
    },
    {
      id: 2,
      studentName: 'Bob Smith',
      studentId: 'STU002',
      grade: 'Grade 10A',
      bloodType: 'A+',
      allergies: ['None'],
      medications: ['None'],
      emergencyContact: 'Mary Smith - +1 234-567-8902',
      lastCheckup: '2026-01-20',
      vaccinations: 'Up to date',
      status: 'Active'
    },
    {
      id: 3,
      studentName: 'Carol Brown',
      studentId: 'STU003',
      grade: 'Grade 11B',
      bloodType: 'B-',
      allergies: ['Latex', 'Dust mites'],
      medications: ['Antihistamine'],
      emergencyContact: 'David Brown - +1 234-567-8903',
      lastCheckup: '2026-03-01',
      vaccinations: 'Incomplete',
      status: 'Needs Attention'
    },
    {
      id: 4,
      studentName: 'David Wilson',
      studentId: 'STU004',
      grade: 'Grade 9C',
      bloodType: 'AB+',
      allergies: ['Food coloring'],
      medications: ['None'],
      emergencyContact: 'Lisa Wilson - +1 234-567-8904',
      lastCheckup: '2025-12-10',
      vaccinations: 'Up to date',
      status: 'Overdue Checkup'
    }
  ]

  const stats = [
    { title: 'Total Records', value: '1,247', change: '+23', trend: 'up' },
    { title: 'Up-to-date Records', value: '1,189', change: '+18', trend: 'up' },
    { title: 'Need Attention', value: '34', change: '+3', trend: 'up' },
    { title: 'Emergency Alerts', value: '8', change: '+2', trend: 'up' }
  ]

  const healthAlerts = [
    {
      type: 'Severe Allergy',
      student: 'Alice Johnson',
      details: 'Severe peanut allergy - EpiPen required',
      priority: 'High'
    },
    {
      type: 'Medication Required',
      student: 'Carol Brown',
      details: 'Daily antihistamine for dust allergy',
      priority: 'Medium'
    },
    {
      type: 'Vaccination Due',
      student: 'Emma Davis',
      details: 'Hepatitis B booster required',
      priority: 'Medium'
    }
  ]

  const columns = [
    { 
      key: 'studentName', 
      header: 'Student',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{row.studentId} • {row.grade}</p>
        </div>
      )
    },
    { key: 'bloodType', header: 'Blood Type' },
    { 
      key: 'allergies', 
      header: 'Allergies',
      render: (value) => (
        <div>
          {value.length > 0 ? (
            value.map((allergy, index) => (
              <span key={index} className={`inline-block px-2 py-1 rounded-full text-xs mr-1 mb-1 ${
                allergy === 'None' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {allergy}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">None</span>
          )}
        </div>
      )
    },
    { 
      key: 'medications', 
      header: 'Medications',
      render: (value) => (
        <div>
          {value.length > 0 ? (
            value.map((med, index) => (
              <span key={index} className={`inline-block px-2 py-1 rounded-full text-xs mr-1 mb-1 ${
                med === 'None' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {med}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">None</span>
          )}
        </div>
      )
    },
    { 
      key: 'vaccinations', 
      header: 'Vaccinations',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Up to date' ? 'bg-green-100 text-green-800' :
          value === 'Incomplete' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'lastCheckup', header: 'Last Checkup' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Active' ? 'bg-green-100 text-green-800' :
          value === 'Needs Attention' ? 'bg-yellow-100 text-yellow-800' :
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
          <h1 className="text-3xl font-bold text-gray-900">Health Records</h1>
          <p className="text-gray-600">Manage student health information and medical records</p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Add Health Record
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Alerts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900">Health Alerts</h3>
              </div>
              <div className="space-y-3">
                {healthAlerts.map((alert, index) => (
                  <div key={index} className={`p-3 border rounded-lg ${
                    alert.priority === 'High' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-900">{alert.type}</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        alert.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {alert.priority}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{alert.student}</p>
                    <p className="text-sm text-gray-600">{alert.details}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Alerts
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <HeartIcon className="h-8 w-8 text-red-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Health Checkup</p>
                  <p className="text-sm text-gray-600">Schedule checkups</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <ClipboardDocumentCheckIcon className="h-8 w-8 text-primary-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Vaccination Log</p>
                  <p className="text-sm text-gray-600">Track vaccinations</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <ExclamationTriangleIcon className="h-8 w-8 text-orange-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Allergy Alert</p>
                  <p className="text-sm text-gray-600">Manage allergies</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <PhoneIcon className="h-8 w-8 text-primary-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Emergency Contact</p>
                  <p className="text-sm text-gray-600">Update contacts</p>
                </motion.button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Student Health Records</h3>
            <div className="flex gap-2">
              <select 
                value={gradeFilter} 
                onChange={(e) => setGradeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Grades</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Records</option>
                <option value="active">Active</option>
                <option value="attention">Needs Attention</option>
                <option value="overdue">Overdue Checkup</option>
              </select>
            </div>
          </div>
          <DataTable
            data={mockHealthRecords}
            columns={columns}
            searchPlaceholder="Search health records..."
          />
        </div>
      </Card>
    </div>
  )
}

export default HealthRecords