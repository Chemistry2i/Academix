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
  const [currentTime, setCurrentTime] = useState(new Date())
  const [stats, setStats] = useState({
    totalStudents: 1247,
    totalTeachers: 89,
    totalCourses: 24,
    averageGrade: 78.5
  })
  const [loading, setLoading] = useState(false)

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // In a real app, you'd fetch from your API
        // const data = await dashboardService.getStats()
        // setStats(data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Chart data
  const studentEnrollmentData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Student Enrollments',
        data: [45, 52, 38, 67, 73, 89],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 8
      }
    ]
  }

  const gradeDistributionData = {
    labels: ['A', 'B', 'C', 'D', 'F'],
    datasets: [
      {
        data: [25, 35, 30, 8, 2],
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
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Attendance Rate (%)',
        data: [95, 87, 92, 89, 94, 85],
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
                  {getGreeting()}, {user?.firstName || 'Admin'}! 👋
                </h1>
                <p className="text-gray-600 mt-1">
                  Welcome back to your dashboard
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
              <Button size="sm" className="bg-primary-600 hover:bg-primary-700">
                <AcademicCapIcon className="w-4 h-4 mr-2" />
                Add Student
              </Button>
              <Button variant="outline" size="sm">
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
          value={stats.totalStudents.toLocaleString()}
          change="+12%"
          changeType="positive"
          icon={AcademicCapIcon}
          color="blue"
        />
        <StatCard
          title="Total Teachers"
          value={stats.totalTeachers}
          change="+3%"
          changeType="positive"
          icon={UserGroupIcon}
          color="green"
        />
        <StatCard
          title="Active Courses"
          value={stats.totalCourses}
          change="+2"
          changeType="positive"
          icon={BookOpenIcon}
          color="purple"
        />
        <StatCard
          title="Average Grade"
          value={`${stats.averageGrade}%`}
          change="+2.3%"
          changeType="positive"
          icon={ChartBarIcon}
          color="yellow"
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
            <p className="text-gray-600 text-sm">Current semester grades</p>
          </div>
          <div className="h-64">
            <Doughnut data={gradeDistributionData} options={doughnutOptions} />
          </div>
        </Card>

        {/* Attendance Rate */}
        <Card className="col-span-1 lg:col-span-2 xl:col-span-3">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Attendance Rate</h3>
            <p className="text-gray-600 text-sm">Average daily attendance percentage</p>
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
            {[
              { name: 'Alice Johnson', class: 'S.6 Science', date: '2 hours ago' },
              { name: 'Bob Smith', class: 'S.5 Arts', date: '4 hours ago' },
              { name: 'Carol Williams', class: 'S.4 General', date: '1 day ago' },
              { name: 'David Brown', class: 'S.6 Commerce', date: '2 days ago' }
            ].map((student, index) => (
              <motion.div
                key={index}
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
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
            <p className="text-gray-600 text-sm">Important dates and deadlines</p>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Mid-term Exams', date: 'March 15-20', type: 'exam' },
              { title: 'Parent-Teacher Meeting', date: 'March 25', type: 'meeting' },
              { title: 'Sports Day', date: 'April 2', type: 'event' },
              { title: 'End of Term', date: 'April 15', type: 'deadline' }
            ].map((event, index) => (
              <motion.div
                key={index}
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
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard