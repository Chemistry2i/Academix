import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { 
  DocumentChartBarIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  UsersIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'
import { useAuth } from '../contexts/AuthContext'
import { teacherPortalService } from '../services/teacherPortalService'
import { resultsService } from '../services/resultsService'
import { assignmentService } from '../services/assignmentService'
import { classService } from '../services/classService'
import subjectService from '../services/subjectService'

const Reports = () => {
  const location = useLocation()
  const { user } = useAuth()
  const isTeacherPortal = location.pathname.startsWith('/teacher')
  const [selectedReport, setSelectedReport] = useState('academic')
  const [dateRange, setDateRange] = useState('thisMonth')
  const [loading, setLoading] = useState(true)
  const [teacherReports, setTeacherReports] = useState([])
  const [stats, setStats] = useState({
    reportsGenerated: 0,
    pendingReports: 0,
    dataCoverage: 0,
    downloadRate: 0
  })

  const allReportTypes = [
    { id: 'academic', name: 'Academic Reports', icon: ChartBarIcon },
    { id: 'attendance', name: 'Attendance Reports', icon: CalendarIcon },
    { id: 'financial', name: 'Financial Reports', icon: DocumentTextIcon },
    { id: 'student', name: 'Student Reports', icon: UsersIcon }
  ]
  const reportTypes = isTeacherPortal
    ? allReportTypes.filter(t => ['academic', 'attendance'].includes(t.id))
    : allReportTypes

  const mockReports = [
    {
      id: 1,
      name: 'Monthly Academic Performance Report',
      type: 'Academic',
      date: 'Mar 2026',
      status: 'Generated',
      downloadUrl: '#',
      reportKey: 'academic'
    },
    {
      id: 2,
      name: 'Class Attendance Summary',
      type: 'Attendance', 
      date: 'Mar 2026',
      status: 'Generated',
      downloadUrl: '#',
      reportKey: 'attendance'
    },
    {
      id: 3,
      name: 'Fee Collection Report',
      type: 'Financial',
      date: 'Feb 2026',
      status: 'Generated',
      downloadUrl: '#',
      reportKey: 'financial'
    },
    {
      id: 4,
      name: 'Student Enrollment Report',
      type: 'Student',
      date: 'Mar 2026',
      status: 'Generating',
      downloadUrl: null,
      reportKey: 'student'
    }
  ]

  const exportCsv = (rows, filename) => {
    const csv = rows
      .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownload = (report) => {
    if (!report._data) return
    const { results = [], assessments = [], assignments = [], className } = report._data
    if (report.type === 'Academic' && report.id === 'academic-performance') {
      const rows = [['Assessment', 'Class', 'Subject', 'Student', 'Score %', 'Grade']]
      results.forEach(r => {
        rows.push([
          r.assessmentTitle || assessments.find(a => a.id === r.assessmentId)?.title || '',
          r.className || '', r.subjectName || '', r.studentName || '',
          r.percentage != null ? Number(r.percentage).toFixed(1) : '',
          r.grade || ''
        ])
      })
      exportCsv(rows, 'class-performance.csv')
    } else if (report.type === 'Academic' && report.id === 'assignment-status') {
      const rows = [['Title', 'Class', 'Subject', 'Due Date', 'State']]
      assignments.forEach(a => rows.push([a.title || '', a.className || '', a.subjectName || '', a.dueDate || '', a.state || '']))
      exportCsv(rows, 'assignment-status.csv')
    } else if (report.type === 'Attendance') {
      const rows = [['Class', 'Report Generated']]
      rows.push([className, new Date().toISOString().split('T')[0]])
      exportCsv(rows, `attendance-${className}.csv`)
    }
  }

  useEffect(() => {
    if (!isTeacherPortal) { setLoading(false); return }
    const loadTeacherReports = async () => {
      setLoading(true)
      try {
        const [classPayload, subjectPayload] = await Promise.all([
          classService.getClasses().catch(() => []),
          subjectService.getAllSubjects().catch(() => [])
        ])
        const classList = teacherPortalService.normalizeArray(classPayload, ['classes', 'data'])
        const subjectList = teacherPortalService.normalizeArray(subjectPayload, ['subjects', 'data'])
        const scope = await teacherPortalService.getTeacherContext(user, { classes: classList, subjects: subjectList })
        const [assessments, results, assignments] = await Promise.all([
          resultsService.getAssessments().catch(() => []),
          resultsService.getResults().catch(() => []),
          assignmentService.getAssignments().catch(() => [])
        ])
        const scopedAssessments = teacherPortalService.filterAssessmentsByScope(assessments, scope)
        const scopedResults = teacherPortalService.filterResultsByScope(results, scope)
        const scopedAssignments = teacherPortalService.filterAssignmentsByScope(assignments, scope)
        const now = new Date()
        const dateLabel = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        const reports = [
          {
            id: 'academic-performance',
            name: 'Class Performance Summary',
            type: 'Academic',
            date: dateLabel,
            status: scopedResults.length > 0 ? 'Ready' : 'No Data',
            downloadUrl: scopedResults.length > 0 ? '#' : null,
            reportKey: 'academic',
            _data: { results: scopedResults, assessments: scopedAssessments }
          },
          {
            id: 'assignment-status',
            name: 'Assignment Completion Report',
            type: 'Academic',
            date: dateLabel,
            status: scopedAssignments.length > 0 ? 'Ready' : 'No Data',
            downloadUrl: scopedAssignments.length > 0 ? '#' : null,
            reportKey: 'academic',
            _data: { assignments: scopedAssignments }
          },
          ...scope.assignedClassNames.map(className => ({
            id: `attendance-${className}`,
            name: `${className} Attendance Summary`,
            type: 'Attendance',
            date: dateLabel,
            status: 'Ready',
            downloadUrl: '#',
            reportKey: 'attendance',
            _data: { className }
          }))
        ]
        setTeacherReports(reports)
        setStats({
          reportsGenerated: reports.filter(r => r.status === 'Ready').length,
          pendingReports: reports.filter(r => r.status === 'No Data').length,
          dataCoverage: scopedResults.length > 0 ? Math.min(100, scopedResults.length * 5) : 0,
          downloadRate: 0
        })
      } finally {
        setLoading(false)
      }
    }
    loadTeacherReports()
  }, [isTeacherPortal, user])

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
          value === 'Generated' || value === 'Ready' ? 'bg-green-100 text-green-800' :
          value === 'Generating' ? 'bg-yellow-100 text-yellow-800' :
          value === 'No Data' ? 'bg-gray-100 text-gray-500' :
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => isTeacherPortal ? handleDownload(row) : undefined}
            >
              <ArrowDownTrayIcon className="w-3.5 h-3.5 mr-1" />
              Download
            </Button>
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
        <Button className="flex items-center gap-2" onClick={isTeacherPortal ? undefined : undefined}>
          <DocumentChartBarIcon className="h-5 w-5" />
          {isTeacherPortal ? 'Refresh Reports' : 'Generate Report'}
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
            data={isTeacherPortal
              ? teacherReports.filter(r => !r.reportKey || r.reportKey === selectedReport)
              : mockReports
            }
            columns={columns}
            searchPlaceholder="Search reports..."
          />
        </div>
      </Card>
    </div>
  )
}

export default Reports