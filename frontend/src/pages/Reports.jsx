import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentChartBarIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'
import { reportsService } from '../services/reportsService'

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('academic')
  const [dateRange, setDateRange] = useState('thisMonth')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    reportsGenerated: 0,
    pendingReports: 0,
    dataCoverage: 0,
    downloadRate: 0
  })

  const reportTypes = [
    { id: 'academic', name: 'Academic Reports', icon: ChartBarIcon },
    { id: 'attendance', name: 'Attendance Reports', icon: CalendarIcon },
    { id: 'financial', name: 'Financial Reports', icon: DocumentTextIcon },
    { id: 'student', name: 'Student Reports', icon: UsersIcon }
  ]

  const mockReports = [
    {
      id: 1,
      name: 'Monthly Academic Performance Report',
      type: 'Academic',
      date: 'Mar 2026',
      status: 'Generated',
      downloadUrl: '#'
    },
    {
      id: 2,
      name: 'Class Attendance Summary',
      type: 'Attendance', 
      date: 'Mar 2026',
      status: 'Generated',
      downloadUrl: '#'
    },
    {
      id: 3,
      name: 'Fee Collection Report',
      type: 'Financial',
      date: 'Feb 2026',
      status: 'Generated',
      downloadUrl: '#'
    },
    {
      id: 4,
      name: 'Student Enrollment Report',
      type: 'Student',
      date: 'Mar 2026',
      status: 'Generating',
      downloadUrl: null
    }
  ]

  const statsDisplay = [
    { title: 'Reports Generated', value: loading ? '...' : stats.reportsGenerated.toString(), change: '', trend: 'up' },
    { title: 'Pending Reports', value: loading ? '...' : stats.pendingReports.toString(), change: '', trend: 'up' },
    { title: 'Data Coverage', value: loading ? '...' : `${stats.dataCoverage}%`, change: '', trend: 'up' },
    { title: 'Download Rate', value: loading ? '...' : `${stats.downloadRate}%`, change: '', trend: 'up' }
  ]

  const columns = [
    { key: 'name', header: 'Report Name' },
    { key: 'type', header: 'Type' },
    { key: 'date', header: 'Date' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Generated' ? 'bg-green-100 text-green-800' :
          value === 'Generating' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: 'actions', 
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          {row.downloadUrl && (
            <Button size="sm" variant="outline">Download</Button>
          )}
          <Button size="sm" variant="ghost">View</Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate and view comprehensive reports</p>
        </div>
        <Button className="flex items-center gap-2">
          <DocumentChartBarIcon className="h-5 w-5" />
          Generate Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsDisplay.map((stat, index) => (
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

      {/* Report Types */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {reportTypes.map((type) => (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedReport(type.id)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedReport === type.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <type.icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-medium text-gray-900">{type.name}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </Card>

      {/* Reports Table */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
            <div className="flex gap-2">
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
          <DataTable
            data={mockReports}
            columns={columns}
            searchPlaceholder="Search reports..."
          />
        </div>
      </Card>
    </div>
  )
}

export default Reports