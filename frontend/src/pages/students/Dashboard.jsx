import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AcademicCapIcon,
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
import { assignmentService } from '../../services/assignmentService'
import { studentService } from '../../services/studentService'
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

const StudentDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [assignmentSummary, setAssignmentSummary] = useState({
    assignmentsDue: 0,
    upcomingAssignments: []
  })

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const stats = {
    currentGrade: 85.5,
    assignmentsDue: assignmentSummary.assignmentsDue,
    attendanceRate: 92,
    coursesEnrolled: 8
  }

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const studentsPayload = await studentService.getStudents(true).catch(() => ({ students: [] }))
        const students = studentsPayload.students || studentsPayload || []
        const currentStudent = students.find((student) => {
          return String(student.email || '').toLowerCase() === String(user?.email || '').toLowerCase()
        })

        const studentContext = {
          studentId: currentStudent?.id || '',
          studentEmail: user?.email || currentStudent?.email || '',
          studentName: currentStudent
            ? [currentStudent.firstName, currentStudent.otherNames, currentStudent.lastName].filter(Boolean).join(' ')
            : `${user?.firstName || 'Student'} ${user?.lastName || ''}`.trim(),
          classId: currentStudent?.schoolClass?.id || currentStudent?.classId || '',
          className: currentStudent?.schoolClass?.name || currentStudent?.currentClass || ''
        }

        const publishedAssignments = await assignmentService.getPublishedAssignments({
          studentContext,
          classId: studentContext.classId || undefined,
          className: studentContext.className || undefined
        })
        const actionableAssignments = publishedAssignments.filter(
          (assignment) => !['submitted', 'reviewed'].includes(assignment.submissionStatus) && assignment.state !== 'closed'
        )

        const sortedAssignments = actionableAssignments.sort((left, right) => {
          const leftDate = new Date(`${left.dueDate || ''}T${left.dueTime || '23:59'}`).getTime()
          const rightDate = new Date(`${right.dueDate || ''}T${right.dueTime || '23:59'}`).getTime()
          return leftDate - rightDate
        })

        setAssignmentSummary({
          assignmentsDue: actionableAssignments.length,
          upcomingAssignments: sortedAssignments.slice(0, 4)
        })
      } catch (error) {
        console.error('Failed to load student dashboard assignments:', error)
        setAssignmentSummary({ assignmentsDue: 0, upcomingAssignments: [] })
      }
    }

    loadAssignments()
  }, [user?.email, user?.firstName, user?.lastName])

  // Student chart data
  const myGradesData = {
    labels: ['Math', 'English', 'Science', 'History', 'Geography', 'French'],
    datasets: [
      {
        label: 'My Current Grades',
        data: [88, 92, 78, 85, 90, 82],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  }

  const attendanceTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'My Attendance %',
        data: [95, 90, 100, 88, 92, 94],
        borderColor: 'rgba(147, 51, 234, 1)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  const subjectProgressData = {
    labels: ['Math', 'English', 'Science', 'History'],
    datasets: [
      {
        data: [88, 92, 78, 85],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
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
                  {getGreeting()}, {user?.firstName || 'Student'}! 👋
                </h1>
                <p className="text-gray-600 mt-1">
                  Ready to continue your learning journey?
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
                onClick={() => navigate('/student/assignments')}
              >
                <BookOpenIcon className="w-4 h-4 mr-2" />
                View Assignments
              </Button>
              <Button variant="outline" size="sm">
                <AcademicCapIcon className="w-4 h-4 mr-2" />
                My Grades
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Current Grade"
          value={`${stats.currentGrade}%`}
          change="+2.5%"
          changeType="positive"
          icon={AcademicCapIcon}
          color="blue"
        />
        <StatCard
          title="Assignments Due"
          value={stats.assignmentsDue}
          change="-2"
          changeType="positive"
          icon={BookOpenIcon}
          color="yellow"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          change="+3%"
          changeType="positive"
          icon={ChartBarIcon}
          color="green"
        />
        <StatCard
          title="Courses Enrolled"
          value={stats.coursesEnrolled}
          change="0"
          changeType="neutral"
          icon={AcademicCapIcon}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* My Grades Chart */}
        <Card className="col-span-1 xl:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Subject Grades</h3>
            <p className="text-gray-600 text-sm">Current semester performance</p>
          </div>
          <div className="h-64">
            <Bar data={myGradesData} options={chartOptions} />
          </div>
        </Card>

        {/* Subject Progress */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Subject Progress</h3>
            <p className="text-gray-600 text-sm">Current academic standing</p>
          </div>
          <div className="h-64">
            <Doughnut data={subjectProgressData} options={doughnutOptions} />
          </div>
        </Card>

        {/* My Attendance Trend */}
        <Card className="col-span-1 lg:col-span-2 xl:col-span-3">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Attendance Trend</h3>
            <p className="text-gray-600 text-sm">Weekly attendance percentage</p>
          </div>
          <div className="h-64">
            <Line data={attendanceTrendData} options={chartOptions} />
          </div>
        </Card>
      </div>

      {/* Student Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h3>
            <p className="text-gray-600 text-sm">Tasks due soon</p>
          </div>
          <div className="space-y-3">
            {assignmentSummary.upcomingAssignments.map((assignment, index) => (
              <motion.div
                key={assignment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    assignment.state === 'overdue' ? 'bg-red-500' :
                    assignment.type === 'PROJECT' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                    <p className="text-xs text-gray-500">{assignment.subjectName}</p>
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'TBA'}
                </div>
              </motion.div>
            ))}
            {!assignmentSummary.upcomingAssignments.length && (
              <div className="text-sm text-gray-500">No upcoming assignments yet.</div>
            )}
          </div>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
            <p className="text-gray-600 text-sm">Your classes for today</p>
          </div>
          <div className="space-y-3">
            {[
              { subject: 'Mathematics', time: '08:00 - 09:00', room: 'Room 101', teacher: 'Mr. Anderson' },
              { subject: 'English', time: '09:15 - 10:15', room: 'Room 205', teacher: 'Ms. Johnson' },
              { subject: 'Physics', time: '10:30 - 11:30', room: 'Lab 1', teacher: 'Dr. Smith' },
              { subject: 'History', time: '13:00 - 14:00', room: 'Room 310', teacher: 'Mrs. Brown' }
            ].map((classItem, index) => (
              <motion.div
                key={index}
                className="flex items-center p-3 border border-gray-200 rounded-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{classItem.subject}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{classItem.time} • {classItem.room} • {classItem.teacher}</span>
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

export default StudentDashboard