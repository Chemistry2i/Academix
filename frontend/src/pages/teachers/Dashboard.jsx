import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ClockIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon
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
import { classService } from '../../services/classService'
import { timetableService } from '../../services/timetableService'
import { studentService } from '../../services/studentService'
import subjectService from '../../services/subjectService'
import { resultsService } from '../../services/resultsService'
import { assignmentService } from '../../services/assignmentService'
import { teacherPortalService } from '../../services/teacherPortalService'
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

const TeacherDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [myClasses, setMyClasses] = useState([])
  const [todayClasses, setTodayClasses] = useState([])
  const [markQueue, setMarkQueue] = useState([])
  const [stats, setStats] = useState({
    myStudents: 0,
    myClasses: 0,
    mySubjects: 0,
    pendingGrades: 0
  })
  const [workloadSummary, setWorkloadSummary] = useState({
    weeklyPeriods: 0,
    todayPeriods: 0,
    todayTeachingMinutes: 0,
    pendingAssignmentReviews: 0,
    totalOpenTasks: 0,
    dailyBreakdown: []
  })
  const [performanceAlerts, setPerformanceAlerts] = useState([])

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      try {
        const [classPayload, studentPayload, subjectPayload, assessmentData, resultsData, assignmentData] = await Promise.all([
          classService.getClasses().catch(() => []),
          studentService.getStudents(true).catch(() => ({ students: [] })),
          subjectService.getAllSubjects().catch(() => []),
          resultsService.getAssessments().catch(() => []),
          resultsService.getResults().catch(() => []),
          assignmentService.getAssignments().catch(() => []),
        ])

        const allClasses = normalizeArray(classPayload)
        const allStudents = normalizeArray(studentPayload, ['students', 'data'])
        const allSubjects = normalizeArray(subjectPayload, ['subjects', 'data'])
        const scope = await teacherPortalService.getTeacherContext(user, {
          classes: allClasses,
          subjects: allSubjects
        })

        const classList = scope.assignedClasses
        const scopedStudents = teacherPortalService.filterStudentsByScope(allStudents, scope)
        const scopedAssessments = teacherPortalService.filterAssessmentsByScope(assessmentData, scope)
        const scopedResults = teacherPortalService.filterResultsByScope(resultsData, scope)
        const scopedAssignments = teacherPortalService.filterAssignmentsByScope(assignmentData, scope)
        const queue = teacherPortalService.buildMarkQueue({
          assessments: scopedAssessments,
          students: scopedStudents,
          results: scopedResults,
          scope
        })

        const teacherTimetable = scope.teacher?.id
          ? normalizeArray(await timetableService.getTeacherTimetable(scope.teacher.id), ['entries', 'data'])
          : []

        const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
        const todayEntries = teacherTimetable.filter((entry) => {
          const day = String(entry.dayOfWeek || entry.day || '').toUpperCase()
          return day === todayName
        })

        const totalStudents = scopedStudents.length
        const subjectCount = scope.availableSubjects.length || scope.subjectNames.length
        const pendingGrades = queue.reduce((sum, item) => sum + item.pendingCount, 0)
        const pendingAssignmentReviews = scopedAssignments.reduce(
          (sum, assignment) => sum + Number(assignment.pendingReviewCount || 0),
          0
        )
        const todayTeachingMinutes = todayEntries.reduce(
          (sum, entry) => sum + calculateDurationMinutes(entry.startTime, entry.endTime),
          0
        )
        const dailyBreakdownMap = teacherTimetable.reduce((acc, entry) => {
          const day = String(entry.dayOfWeek || entry.day || '').toUpperCase()
          if (!day) return acc

          acc[day] = acc[day] || {
            day,
            periods: 0,
            minutes: 0
          }

          acc[day].periods += 1
          acc[day].minutes += calculateDurationMinutes(entry.startTime, entry.endTime)
          return acc
        }, {})

        const orderedDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
        const dailyBreakdown = orderedDays
          .filter((day) => Boolean(dailyBreakdownMap[day]))
          .map((day) => dailyBreakdownMap[day])

        const alerts = buildPerformanceAlerts({
          students: scopedStudents,
          assessments: scopedAssessments,
          results: scopedResults
        })

        setMyClasses(classList)
        setTodayClasses(todayEntries)
        setMarkQueue(queue)
        setStats({
          myStudents: totalStudents,
          myClasses: classList.length,
          mySubjects: subjectCount,
          pendingGrades
        })
        setWorkloadSummary({
          weeklyPeriods: teacherTimetable.length,
          todayPeriods: todayEntries.length,
          todayTeachingMinutes,
          pendingAssignmentReviews,
          totalOpenTasks: pendingGrades + pendingAssignmentReviews,
          dailyBreakdown
        })
        setPerformanceAlerts(alerts)
      } catch (error) {
        console.error('Failed to load teacher dashboard data:', error)
        setMyClasses([])
        setTodayClasses([])
        setMarkQueue([])
        setStats({ myStudents: 0, myClasses: 0, mySubjects: 0, pendingGrades: 0 })
        setWorkloadSummary({
          weeklyPeriods: 0,
          todayPeriods: 0,
          todayTeachingMinutes: 0,
          pendingAssignmentReviews: 0,
          totalOpenTasks: 0,
          dailyBreakdown: []
        })
        setPerformanceAlerts([])
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user?.email])

  const normalizeArray = (payload, keys = []) => {
    if (Array.isArray(payload)) return payload
    if (!payload || typeof payload !== 'object') return []

    for (const key of keys) {
      if (Array.isArray(payload[key])) return payload[key]
    }

    const firstArray = Object.values(payload).find((value) => Array.isArray(value))
    return firstArray || []
  }

  const parseTimeToMinutes = (timeValue) => {
    if (!timeValue || typeof timeValue !== 'string' || !timeValue.includes(':')) return null
    const [hour, minute] = timeValue.split(':').map((value) => Number(value))
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null
    return (hour * 60) + minute
  }

  const calculateDurationMinutes = (startTime, endTime) => {
    const start = parseTimeToMinutes(startTime)
    const end = parseTimeToMinutes(endTime)
    if (start === null || end === null || end <= start) return 0
    return end - start
  }

  const normalizeString = (value) => String(value || '').trim().toLowerCase()

  const getClassIdentity = (item) => ({
    id: String(item?.schoolClass?.id || item?.classId || item?.id || ''),
    name: item?.schoolClass?.name || item?.className || item?.name || item?.currentClass || ''
  })

  const buildPerformanceAlerts = ({ students = [], assessments = [], results = [] }) => {
    const severityRank = { high: 0, medium: 1, low: 2 }
    const alerts = []

    students.forEach((student) => {
      const classInfo = getClassIdentity(student)
      const studentId = String(student?.id || student?.studentId || '')
      if (!studentId) return

      const classAssessments = assessments.filter((assessment) => {
        const assessmentClassId = String(assessment?.classId || '')
        const assessmentClassName = normalizeString(assessment?.className)
        return (classInfo.id && assessmentClassId && classInfo.id === assessmentClassId) ||
          (classInfo.name && assessmentClassName && normalizeString(classInfo.name) === assessmentClassName)
      })

      const studentResults = results.filter((result) => String(result?.studentId || '') === studentId)
      const gradedAssessmentCount = new Set(studentResults.map((result) => result.assessmentId)).size
      const expectedAssessments = classAssessments.length
      const missingAssessments = Math.max(expectedAssessments - gradedAssessmentCount, 0)

      const percentages = studentResults
        .map((result) => Number(result.percentage || 0))
        .filter((value) => Number.isFinite(value))

      const averageScore = percentages.length
        ? Number((percentages.reduce((sum, value) => sum + value, 0) / percentages.length).toFixed(2))
        : 0

      const studentName = [student?.firstName, student?.lastName].filter(Boolean).join(' ').trim() ||
        student?.fullName || 'Student'
      const classLabel = classInfo.name || 'Class'

      if (percentages.length >= 2 && averageScore < 50) {
        alerts.push({
          id: `low-average-${studentId}`,
          severity: 'high',
          studentName,
          className: classLabel,
          type: 'Low Average',
          message: `Average score is ${Math.round(averageScore)}%. Immediate follow-up recommended.`
        })
      }

      if (missingAssessments >= 2) {
        alerts.push({
          id: `missing-marks-${studentId}`,
          severity: missingAssessments >= 4 ? 'high' : 'medium',
          studentName,
          className: classLabel,
          type: 'Missing Marks',
          message: `${missingAssessments} assessment results still missing for this student.`
        })
      }

      const veryLowScores = percentages.filter((value) => value < 40).length
      if (veryLowScores >= 2) {
        alerts.push({
          id: `repeated-low-${studentId}`,
          severity: 'high',
          studentName,
          className: classLabel,
          type: 'Repeated Low Scores',
          message: `${veryLowScores} recent scores below 40% recorded.`
        })
      }
    })

    return alerts
      .sort((left, right) => {
        if (severityRank[left.severity] !== severityRank[right.severity]) {
          return severityRank[left.severity] - severityRank[right.severity]
        }
        return left.studentName.localeCompare(right.studentName)
      })
      .slice(0, 8)
  }

  // Teacher chart data
  const classPerformanceData = {
    labels: myClasses.map((cls) => cls.name || cls.className || 'Class'),
    datasets: [
      {
        label: 'Average Class Grade',
        data: myClasses.map((cls) => Number(cls.avgGrade || cls.averageGrade || cls.classAverage || 0)),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  }

  const attendanceRatesData = {
    labels: myClasses.map((cls) => cls.name || cls.className || 'Class'),
    datasets: [
      {
        label: 'Attendance by Class %',
        data: myClasses.map((cls) => Number(cls.attendance || cls.averageAttendance || 0)),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  const subjectGradesData = {
    labels: ['Above 80', '60 - 79', 'Below 60'],
    datasets: [
      {
        data: [
          myClasses.filter((cls) => Number(cls.avgGrade || cls.averageGrade || 0) >= 80).length,
          myClasses.filter((cls) => {
            const grade = Number(cls.avgGrade || cls.averageGrade || 0)
            return grade >= 60 && grade < 80
          }).length,
          myClasses.filter((cls) => Number(cls.avgGrade || cls.averageGrade || 0) < 60).length
        ],
        backgroundColor: ['#10B981', '#3B82F6', '#EF4444'],
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
              <Button
                size="sm"
                className="bg-primary-600 hover:bg-primary-700"
                onClick={() => navigate('/teacher/classes')}
              >
                <UserGroupIcon className="w-4 h-4 mr-2" />
                My Classes
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/teacher/subjects')}>
                <BookOpenIcon className="w-4 h-4 mr-2" />
                My Subjects
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/teacher/gradebook')}>
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Grade Book
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/teacher/attendance')}>
                <ClockIcon className="w-4 h-4 mr-2" />
                Attendance
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Students"
          value={loading ? '...' : stats.myStudents.toLocaleString()}
          change={loading ? '' : `Across ${stats.myClasses} classes`}
          changeType="positive"
          icon={UserGroupIcon}
          color="blue"
        />
        <StatCard
          title="My Classes"
          value={loading ? '...' : stats.myClasses}
          change={loading ? '' : 'Assigned classes'}
          changeType="neutral"
          icon={AcademicCapIcon}
          color="green"
        />
        <StatCard
          title="My Subjects"
          value={loading ? '...' : stats.mySubjects}
          change={loading ? '' : 'Teaching load'}
          changeType="positive"
          icon={BookOpenIcon}
          color="purple"
        />
        <StatCard
          title="Pending Marks"
          value={loading ? '...' : stats.pendingGrades}
          change={loading ? '' : 'Learner scores still missing'}
          changeType="positive"
          icon={BookOpenIcon}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Workload Summary</h3>
              <p className="text-gray-600 text-sm">Teaching periods and pending teacher tasks.</p>
            </div>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
              {loading ? '...' : `${workloadSummary.totalOpenTasks} open tasks`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Weekly Periods</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{loading ? '...' : workloadSummary.weeklyPeriods}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Today's Periods</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{loading ? '...' : workloadSummary.todayPeriods}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Teaching Time Today</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {loading ? '...' : `${Math.round((workloadSummary.todayTeachingMinutes || 0) / 60)}h`}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Pending Reviews</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{loading ? '...' : workloadSummary.pendingAssignmentReviews}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Load</h3>
            <p className="text-gray-600 text-sm">Periods and minutes by day.</p>
          </div>
          <div className="space-y-3">
            {workloadSummary.dailyBreakdown.map((item) => (
              <div key={item.day} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{item.day[0]}{item.day.slice(1).toLowerCase()}</p>
                  <p className="text-xs text-gray-500">{item.periods} periods</p>
                </div>
                <p className="mt-2 text-xs text-gray-500">{Math.round((item.minutes || 0) / 60)}h scheduled</p>
              </div>
            ))}
            {!loading && !workloadSummary.dailyBreakdown.length && (
              <div className="text-sm text-gray-500">No timetable load found for this week.</div>
            )}
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Class Performance Chart */}
        <Card className="col-span-1 xl:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Class Performance</h3>
            <p className="text-gray-600 text-sm">Average grades from assigned classes</p>
          </div>
          <div className="h-64">
            <Bar data={classPerformanceData} options={chartOptions} />
          </div>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Grade Distribution</h3>
            <p className="text-gray-600 text-sm">Classes grouped by performance</p>
          </div>
          <div className="h-64">
            <Doughnut data={subjectGradesData} options={doughnutOptions} />
          </div>
        </Card>

        {/* Class Attendance */}
        <Card className="col-span-1 lg:col-span-2 xl:col-span-3">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Class Attendance Rates</h3>
            <p className="text-gray-600 text-sm">Attendance from class records</p>
          </div>
          <div className="h-64">
            <Line data={attendanceRatesData} options={chartOptions} />
          </div>
        </Card>
      </div>

      {/* Teacher Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Class Summary */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Classes Snapshot</h3>
            <p className="text-gray-600 text-sm">Enrollment and attendance by class</p>
          </div>
          <div className="space-y-3">
            {myClasses.slice(0, 4).map((cls, index) => (
              <motion.div
                key={`${cls.id || cls.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium text-sm">
                    {(cls.name || 'C')[0]}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{cls.name || cls.className || 'Class'}</p>
                    <p className="text-xs text-gray-500">
                      {cls.subject || cls.mainSubject || 'Subject not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  {Number(cls.currentCount || cls.students || 0)} students
                </div>
              </motion.div>
            ))}
            {!myClasses.length && (
              <div className="text-sm text-gray-500">No assigned classes found.</div>
            )}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Mark Entry Queue</h3>
              <p className="text-gray-600 text-sm">Assessments that still need marks entered</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/teacher/gradebook')}>
              Open
            </Button>
          </div>
          <div className="space-y-3">
            {markQueue.slice(0, 5).map((item, index) => (
              <motion.div
                key={item.id}
                className="rounded-lg border border-gray-200 p-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.className} • {item.subjectName}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${item.pendingCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'}`}>
                    {item.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{item.gradedCount}/{item.totalStudents} marked</span>
                  <span>{item.pendingCount} pending</span>
                </div>
              </motion.div>
            ))}
            {!markQueue.length && (
              <div className="text-sm text-gray-500">No pending assessments in your queue.</div>
            )}
          </div>
        </Card>

        {/* Today's Teaching Schedule */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Classes</h3>
            <p className="text-gray-600 text-sm">Your teaching schedule</p>
          </div>
          <div className="space-y-3">
            {todayClasses.map((lecture, index) => (
              <motion.div
                key={`${lecture.id || lecture.className || index}`}
                className="flex items-center p-3 border border-gray-200 rounded-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {lecture.className || lecture.class?.name || lecture.subjectName || 'Class'}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>
                      {(lecture.startTime && lecture.endTime)
                        ? `${lecture.startTime} - ${lecture.endTime}`
                        : (lecture.time || 'Time TBA')}
                      {' • '}
                      {lecture.room || lecture.classroom || 'Room TBA'}
                      {' • '}
                      {lecture.studentCount ? `${lecture.studentCount} students` : 'Students TBA'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            {!todayClasses.length && (
              <div className="text-sm text-gray-500">No classes scheduled for today.</div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Student Performance Alerts</h3>
            <p className="text-gray-600 text-sm">Learners needing quick intervention based on marks coverage and scores.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate('/teacher/gradebook')}>
            Open Grade Book
          </Button>
        </div>

        <div className="space-y-3">
          {performanceAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border p-3 ${
                alert.severity === 'high'
                  ? 'border-red-200 bg-red-50'
                  : alert.severity === 'medium'
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className={`w-5 h-5 mt-0.5 ${
                    alert.severity === 'high'
                      ? 'text-red-600'
                      : alert.severity === 'medium'
                        ? 'text-amber-600'
                        : 'text-blue-600'
                  }`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{alert.studentName}</p>
                    <p className="text-xs text-gray-500">{alert.className} • {alert.type}</p>
                    <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                  alert.severity === 'high'
                    ? 'bg-red-100 text-red-700'
                    : alert.severity === 'medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                }`}>
                  {alert.severity}
                </span>
              </div>
            </div>
          ))}

          {!loading && !performanceAlerts.length && (
            <div className="rounded-lg border border-dashed border-gray-300 p-5 text-sm text-gray-500">
              No urgent performance alerts right now.
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Teacher Workspace</h3>
          <p className="text-sm text-gray-600">Dashboard content moved to focused pages in the sidebar.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button variant="outline" className="justify-start" onClick={() => navigate('/teacher/notes')}>
            <BookOpenIcon className="w-4 h-4 mr-2" />
            Open Notes
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => navigate('/teacher/resources')}>
            <BookOpenIcon className="w-4 h-4 mr-2" />
            Open Resources
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => navigate('/teacher/invigilation')}>
            <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
            Open Invigilation
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default TeacherDashboard