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
import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import Button from '../../components/common/Button'
import { useAuth } from '../../contexts/AuthContext'

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

const TeacherDashboard = () => {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Teacher-specific stats
  const stats = {
    myStudents: 156,
    myClasses: 6,
    avgClassGrade: 78.5,
    pendingGrades: 24
  }

  // Teacher chart data
  const classPerformanceData = {
    labels: ['S.4A', 'S.4B', 'S.5A', 'S.5B', 'S.6A'],
    datasets: [
      {
        label: 'Average Class Grade',
        data: [82, 78, 85, 79, 88],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  }

  const attendanceRatesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Class Attendance %',
        data: [95, 92, 88, 94, 90, 85],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  const subjectGradesData = {
    labels: ['A', 'B', 'C', 'D', 'F'],
    datasets: [
      {
        data: [30, 40, 20, 8, 2],
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6B7280'],
        borderWidth: 0
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
                  {getGreeting()}, {user?.firstName || 'Teacher'}! 👋
                </h1>
                <p className="text-gray-600 mt-1">
                  Your students are ready to learn today
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
                <UserGroupIcon className="w-4 h-4 mr-2" />
                My Classes
              </Button>
              <Button variant="outline" size="sm">
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Grade Book
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Students"
          value={stats.myStudents.toLocaleString()}
          change="+8"
          changeType="positive"
          icon={UserGroupIcon}
          color="blue"
        />
        <StatCard
          title="My Classes"
          value={stats.myClasses}
          change="0"
          changeType="neutral"
          icon={AcademicCapIcon}
          color="green"
        />
        <StatCard
          title="Avg Class Grade"
          value={`${stats.avgClassGrade}%`}
          change="+1.5%"
          changeType="positive"
          icon={ChartBarIcon}
          color="purple"
        />
        <StatCard
          title="Pending Grades"
          value={stats.pendingGrades}
          change="-12"
          changeType="positive"
          icon={BookOpenIcon}
          color="yellow"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Class Performance Chart */}
        <Card className="col-span-1 xl:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Class Performance</h3>
            <p className="text-gray-600 text-sm">Average grades by class</p>
          </div>
          <div className="h-64">
            <Bar data={classPerformanceData} options={chartOptions} />
          </div>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Grade Distribution</h3>
            <p className="text-gray-600 text-sm">Student grade breakdown</p>
          </div>
          <div className="h-64">
            <Doughnut data={subjectGradesData} options={doughnutOptions} />
          </div>
        </Card>

        {/* Class Attendance */}
        <Card className="col-span-1 lg:col-span-2 xl:col-span-3">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Class Attendance Rates</h3>
            <p className="text-gray-600 text-sm">Daily attendance across my classes</p>
          </div>
          <div className="h-64">
            <Line data={attendanceRatesData} options={chartOptions} />
          </div>
        </Card>
      </div>

      {/* Teacher Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Submissions</h3>
            <p className="text-gray-600 text-sm">Student work to review</p>
          </div>
          <div className="space-y-3">
            {[
              { student: 'Alice Johnson', assignment: 'Math Quiz Ch.5', subject: 'S.6A Math', submitted: '2 hours ago' },
              { student: 'Bob Smith', assignment: 'Physics Lab', subject: 'S.5B Physics', submitted: '4 hours ago' },
              { student: 'Carol Williams', assignment: 'History Essay', subject: 'S.6A History', submitted: '1 day ago' },
              { student: 'David Brown', assignment: 'English Essay', subject: 'S.5A English', submitted: '2 days ago' }
            ].map((submission, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium text-sm">
                    {submission.student[0]}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{submission.student}</p>
                    <p className="text-xs text-gray-500">{submission.assignment} • {submission.subject}</p>
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  {submission.submitted}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Today's Teaching Schedule */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Classes</h3>
            <p className="text-gray-600 text-sm">Your teaching schedule</p>
          </div>
          <div className="space-y-3">
            {[
              { class: 'S.6A Mathematics', time: '08:00 - 09:00', room: 'Room 101', students: '32 students' },
              { class: 'S.5B Physics', time: '09:15 - 10:15', room: 'Lab 1', students: '28 students' },
              { class: 'S.6B Mathematics', time: '10:30 - 11:30', room: 'Room 101', students: '30 students' },
              { class: 'S.5A Physics', time: '13:00 - 14:00', room: 'Lab 2', students: '25 students' }
            ].map((lecture, index) => (
              <motion.div
                key={index}
                className="flex items-center p-3 border border-gray-200 rounded-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{lecture.class}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{lecture.time} • {lecture.room} • {lecture.students}</span>
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

export default TeacherDashboard