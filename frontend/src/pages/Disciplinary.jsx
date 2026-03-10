import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldExclamationIcon, 
  PlusIcon,
  ExclamationCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'

const Disciplinary = () => {
  const [filter, setFilter] = useState('active')
  const [severityFilter, setSeverityFilter] = useState('all')

  const mockDisciplinaryRecords = [
    {
      id: 1,
      studentName: 'Jake Thompson',
      studentId: 'STU001',
      grade: 'Grade 10A',
      incident: 'Disrupting class',
      date: '2026-03-08',
      reportedBy: 'Mrs. Johnson',
      severity: 'Minor',
      action: 'Verbal Warning',
      status: 'Resolved',
      followUp: '2026-03-15'
    },
    {
      id: 2,
      studentName: 'Maria Santos',
      studentId: 'STU002',
      grade: 'Grade 11B',
      incident: 'Inappropriate language',
      date: '2026-03-07',
      reportedBy: 'Mr. Wilson',
      severity: 'Moderate',
      action: 'Detention',
      status: 'In Progress',
      followUp: '2026-03-14'
    },
    {
      id: 3,
      studentName: 'Alex Chen',
      studentId: 'STU003',
      grade: 'Grade 9C',
      incident: 'Fighting in hallway',
      date: '2026-03-06',
      reportedBy: 'Security Guard',
      severity: 'Major',
      action: 'Suspension - 3 days',
      status: 'Active',
      followUp: '2026-03-12'
    },
    {
      id: 4,
      studentName: 'Emma Rodriguez',
      studentId: 'STU004',
      grade: 'Grade 12A',
      incident: 'Cheating on exam',
      date: '2026-03-05',
      reportedBy: 'Prof. Davis',
      severity: 'Major',
      action: 'Parent Conference',
      status: 'Pending',
      followUp: '2026-03-11'
    }
  ]

  const stats = [
    { title: 'Total Incidents', value: '24', change: '+3', trend: 'up' },
    { title: 'Active Cases', value: '8', change: '+1', trend: 'up' },
    { title: 'This Month', value: '12', change: '+2', trend: 'up' },
    { title: 'Resolved Rate', value: '85%', change: '+3%', trend: 'up' }
  ]

  const incidentTypes = [
    { type: 'Disruptive Behavior', count: 8, trend: '+2' },
    { type: 'Academic Dishonesty', count: 3, trend: '+1' },
    { type: 'Inappropriate Language', count: 5, trend: '+1' },
    { type: 'Physical Altercation', count: 2, trend: '0' },
    { type: 'Tardiness/Absence', count: 6, trend: '+3' }
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
    { key: 'incident', header: 'Incident' },
    { key: 'date', header: 'Date' },
    { key: 'reportedBy', header: 'Reported By' },
    { 
      key: 'severity', 
      header: 'Severity',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Major' ? 'bg-red-100 text-red-800' :
          value === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'action', header: 'Action Taken' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Resolved' ? 'bg-green-100 text-green-800' :
          value === 'Active' ? 'bg-blue-100 text-blue-800' :
          value === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'followUp', header: 'Follow-up Date' },
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
          <h1 className="text-3xl font-bold text-gray-900">Disciplinary Records</h1>
          <p className="text-gray-600">Manage student behavior tracking and disciplinary actions</p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Report Incident
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
        {/* Incident Types */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Incident Types (This Month)</h3>
              <div className="space-y-3">
                {incidentTypes.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">{item.type}</p>
                        <p className="text-sm text-gray-600">{item.count} incidents</p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${
                      item.trend.startsWith('+') ? 'text-red-600' :
                      item.trend === '0' ? 'text-gray-600' : 'text-green-600'
                    }`}>
                      {item.trend}
                    </span>
                  </div>
                ))}
              </div>
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
                  <ExclamationCircleIcon className="h-8 w-8 text-red-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Report Incident</p>
                  <p className="text-sm text-gray-600">File new report</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <ClockIcon className="h-8 w-8 text-yellow-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Follow-ups Due</p>
                  <p className="text-sm text-gray-600">5 pending</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <DocumentTextIcon className="h-8 w-8 text-primary-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Generate Report</p>
                  <p className="text-sm text-gray-600">Monthly summary</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <UserIcon className="h-8 w-8 text-primary-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Student History</p>
                  <p className="text-sm text-gray-600">View past incidents</p>
                </motion.button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">All Disciplinary Records</h3>
            <div className="flex gap-2">
              <select 
                value={severityFilter} 
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Severities</option>
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="major">Major</option>
              </select>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="active">Active Cases</option>
                <option value="resolved">Resolved</option>
                <option value="pending">Pending Action</option>
                <option value="all">All Records</option>
              </select>
            </div>
          </div>
          <DataTable
            data={mockDisciplinaryRecords}
            columns={columns}
            searchPlaceholder="Search disciplinary records..."
          />
        </div>
      </Card>
    </div>
  )
}

export default Disciplinary