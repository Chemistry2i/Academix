import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import Card from '../components/common/Card'
import StatCard from '../components/common/StatCard'
import Button from '../components/common/Button'
import { useAuth } from '../contexts/AuthContext'
import { dashboardService } from '../services/dashboardService'
import { studentService } from '../services/studentService'
import { examService } from '../services/examService'
import { attendanceService } from '../services/attendanceService'
import { useNavigate } from 'react-router-dom'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
)

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    totalClasses: 0,
    activeStudents: 0,
    activeTeachers: 0,
    averageAttendance: 0,
    todayAttendance: 0,
    maleStudents: 0,
    femaleStudents: 0
  })
  const [recentEnrollments, setRecentEnrollments] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [enrollmentTrend, setEnrollmentTrend] = useState({ labels: [], values: [] })
  const [attendanceTrend, setAttendanceTrend] = useState({ labels: [], values: [] })
  const [loading, setLoading] = useState(true)

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const [statsResponse, studentsResponse, eventsResponse, attendanceResponse] = await Promise.all([
          dashboardService.getStats(),
          studentService.getStudents(true).catch(() => ({ students: [] })),
          examService.getUpcomingExams().catch(() => []),
          attendanceService.getAttendanceStatistics().catch(() => null)
        ])

        const students = extractArray(studentsResponse, ['students'])
        const upcoming = extractArray(eventsResponse, ['exams', 'upcomingExams'])

        setRecentEnrollments(buildRecentEnrollments(students))
        setEnrollmentTrend(buildEnrollmentTrend(students))
        setUpcomingEvents(buildUpcomingEvents(upcoming))
        setAttendanceTrend(buildAttendanceTrend(attendanceResponse))

        if (statsResponse.success) {
          setStats({
            totalStudents: statsResponse.data.totalStudents || 0,
            totalTeachers: statsResponse.data.totalTeachers || 0,
            totalSubjects: statsResponse.data.totalSubjects || 0,
            totalClasses: statsResponse.data.totalClasses || 0,
            activeStudents: statsResponse.data.activeStudents || 0,
            activeTeachers: statsResponse.data.activeTeachers || 0,
            averageAttendance: statsResponse.data.averageAttendance || 0,
            todayAttendance: statsResponse.data.todayAttendance || 0,
            maleStudents: statsResponse.data.maleStudents || 0,
            femaleStudents: statsResponse.data.femaleStudents || 0
          })
        } else {
          console.error('Failed to fetch dashboard stats:', statsResponse.message)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const extractArray = (payload, keys = []) => {
    if (Array.isArray(payload)) return payload
    if (!payload || typeof payload !== 'object') return []

    for (const key of keys) {
      if (Array.isArray(payload[key])) return payload[key]
    }

    if (Array.isArray(payload.data)) return payload.data

    const firstArray = Object.values(payload).find((v) => Array.isArray(v))
    return firstArray || []
  }

  const formatDateLabel = (dateValue) => {
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) return 'Unknown date'

    const diffMs = Date.now() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours < 24) {
      return `${Math.max(diffHours, 1)} hour${diffHours === 1 ? '' : 's'} ago`
    }

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
    }

    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const buildRecentEnrollments = (students) => {
    return [...students]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4)
      .map((student) => ({
        name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unnamed Student',
        class: student.currentClass || student.schoolClass?.name || 'Class not set',
        date: formatDateLabel(student.createdAt)
      }))
  }

  const buildEnrollmentTrend = (students) => {
    const months = []
    for (let i = 5; i >= 0; i -= 1) {
      const dt = new Date()
      dt.setMonth(dt.getMonth() - i)
      const label = dt.toLocaleDateString('en-US', { month: 'short' })
      const key = `${dt.getFullYear()}-${dt.getMonth()}`
      months.push({ key, label, value: 0 })
    }

    for (const student of students) {
      const created = new Date(student.createdAt)
      if (Number.isNaN(created.getTime())) continue

      const key = `${created.getFullYear()}-${created.getMonth()}`
      const month = months.find((m) => m.key === key)
      if (month) month.value += 1
    }

    return {
      labels: months.map((m) => m.label),
      values: months.map((m) => m.value)
    }
  }

  const buildUpcomingEvents = (events) => {
    return events.slice(0, 4).map((event) => ({
      title: event.name || event.title || event.examName || 'Upcoming Event',
      date: new Date(event.startDate || event.examDate || event.date || Date.now()).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      type: (event.examType || event.type || 'event').toLowerCase()
    }))
  }

  const buildAttendanceTrend = (payload) => {
    if (!payload) return { labels: [], values: [] }

    const asArray = Array.isArray(payload)
      ? payload
      : payload.dailyAttendance || payload.weeklyAttendance || payload.attendanceByDay || []

    if (!Array.isArray(asArray) || asArray.length === 0) {
      return { labels: [], values: [] }
    }

    const normalized = asArray.slice(0, 7).map((item) => ({
      label: item.day || item.label || item.date || item.dayOfWeek || 'N/A',
      value: Number(item.percentage || item.attendanceRate || item.rate || item.value || 0)
    }))

    return {
      labels: normalized.map((i) => i.label),
      values: normalized.map((i) => i.value)
    }
  }

  // Chart data
  const studentEnrollmentData = {
    labels: enrollmentTrend.labels,
    datasets: [
      {
        label: 'Student Enrollments',
        data: enrollmentTrend.values,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 8
      }
    ]
  }

  const gradeDistributionData = {
    labels: ['Male', 'Female', 'Unspecified'],
    datasets: [
      {
        data: [
          stats.maleStudents || 0,
          stats.femaleStudents || 0,
          Math.max((stats.totalStudents || 0) - (stats.maleStudents || 0) - (stats.femaleStudents || 0), 0)
        ],
        backgroundColor: [
          '#10B981',
          '#3B82F6',
          '#F59E0B',
          '#EF4444',
          '#6B7280'
        ],
        borderWidth: 0
      }
    ]
  }

  const attendanceData = {
    labels: attendanceTrend.labels,
    datasets: [
      {
        label: 'Attendance Rate (%)',
        data: attendanceTrend.values,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        border: {
          display: false
        }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      }
    },
    cutout: '70%'
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <div className="bg-primary-100 p-3 rounded-xl mr-4">
                <SparklesIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getGreeting()}, {user?.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : 'Administrator'}! 👋
                </h1>
                <p className="text-gray-600 mt-1">
                  Here's your school overview for today.
                </p>
              </div>
            </div>

            {/* Date and Time */}
            <div className="flex items-center space-x-6 mb-4">
              <div className="flex items-center text-gray-500">
                <CalendarDaysIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {currentTime.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center text-gray-500">
                <ClockIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 lg:mt-0 lg:ml-6">
            <div className="flex space-x-3">
              <Button
                size="sm"
                className="bg-primary-600 hover:bg-primary-700"
                onClick={() => navigate('/admin/students')}
              >
                <AcademicCapIcon className="w-4 h-4 mr-2" />
                Add Student
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/reports')}>
                <ChartBarIcon className="w-4 h-4 mr-2" />
                View Reports
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={loading ? "..." : stats.totalStudents.toLocaleString()}
          change={loading ? "" : `Active: ${stats.activeStudents}`}
          changeType="positive"
          icon={AcademicCapIcon}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Total Teachers"
          value={loading ? "..." : stats.totalTeachers.toLocaleString()}
          change={loading ? "" : `Active: ${stats.activeTeachers}`}
          changeType="positive"
          icon={UserGroupIcon}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Total Subjects"
          value={loading ? "..." : stats.totalSubjects.toLocaleString()}
          change={loading ? "" : `Classes: ${stats.totalClasses}`}
          changeType="positive"
          icon={BookOpenIcon}
          color="purple"
          loading={loading}
        />
        <StatCard
          title="Attendance Today"
          value={loading ? "..." : stats.todayAttendance.toLocaleString()}
          change={loading ? "" : `Avg: ${Math.round(stats.averageAttendance)}%`}
          changeType="positive"
          icon={ChartBarIcon}
          color="yellow"
          loading={loading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Student Enrollments Chart */}
        <Card className="col-span-1 xl:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Student Enrollments</h3>
            <p className="text-gray-600 text-sm">Monthly enrollment trends</p>
          </div>
          <div className="h-64">
            <Bar data={studentEnrollmentData} options={chartOptions} />
          </div>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Grade Distribution</h3>
            <p className="text-gray-600 text-sm">Student composition from live records</p>
          </div>
          <div className="h-64">
            <Doughnut data={gradeDistributionData} options={doughnutOptions} />
          </div>
        </Card>

        {/* Attendance Rate */}
        <Card className="col-span-1 lg:col-span-2 xl:col-span-3">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Attendance Rate</h3>
            <p className="text-gray-600 text-sm">Average attendance trend from attendance records</p>
          </div>
          <div className="h-64">
            <Line data={attendanceData} options={chartOptions} />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Enrollments</h3>
            <p className="text-gray-600 text-sm">Latest student registrations</p>
          </div>
          <div className="space-y-3">
            {recentEnrollments.map((student, index) => (
              <motion.div
                key={`${student.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium text-sm">
                    {student.name[0]}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.class}</p>
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  {student.date}
                </div>
              </motion.div>
            ))}
            {!recentEnrollments.length && (
              <div className="text-sm text-gray-500">No recent enrollment data available.</div>
            )}
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
            <p className="text-gray-600 text-sm">Important dates and deadlines</p>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={`${event.title}-${index}`}
                className="flex items-center p-3 border border-gray-200 rounded-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  event.type === 'exam' ? 'bg-red-500' :
                  event.type === 'meeting' ? 'bg-blue-500' :
                  event.type === 'event' ? 'bg-green-500' :
                  'bg-yellow-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <CalendarDaysIcon className="w-3 h-3 mr-1" />
                    {event.date}
                  </div>
                </div>
              </motion.div>
            ))}
            {!upcomingEvents.length && (
              <div className="text-sm text-gray-500">No upcoming events available.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard