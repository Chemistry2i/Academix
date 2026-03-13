import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Card from '../../components/common/Card'
import DataTable from '../../components/common/DataTable'
import { useAuth } from '../../contexts/AuthContext'
import { studentService } from '../../services/studentService'
import { classService } from '../../services/classService'
import { resultsService } from '../../services/resultsService'
import { assignmentService } from '../../services/assignmentService'

const toLetterGrade = (value) => {
  const score = Number(value || 0)
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 75) return 'B+'
  if (score >= 70) return 'B'
  if (score >= 65) return 'C+'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

const StudentCourses = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [myCourses, setMyCourses] = useState([])
  const [studentLabel, setStudentLabel] = useState('')

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true)
      try {
        const [studentsPayload, classesPayload] = await Promise.all([
          studentService.getStudents(true).catch(() => ({ students: [] })),
          classService.getClasses().catch(() => [])
        ])

        const students = studentsPayload.students || studentsPayload.data || studentsPayload || []
        const classes = Array.isArray(classesPayload) ? classesPayload : []

        const student = students.find((item) => {
          return String(item.email || '').toLowerCase() === String(user?.email || '').toLowerCase()
        }) || null

        if (!student) {
          setMyCourses([])
          return
        }

        setStudentLabel([student.firstName, student.lastName].filter(Boolean).join(' ').trim())

        const [transcript, assignments] = await Promise.all([
          resultsService.getStudentTranscript({ studentId: student.id }).catch(() => ({ subjectSummaries: [] })),
          assignmentService.getPublishedAssignments({
            studentContext: {
              studentId: student.id,
              studentEmail: student.email,
              classId: student.schoolClass?.id || student.classId || '',
              className: student.schoolClass?.name || student.currentClass || ''
            },
            classId: student.schoolClass?.id || student.classId || undefined,
            className: student.schoolClass?.name || student.currentClass || undefined
          }).catch(() => [])
        ])

        const selectedClass = classes.find((item) => {
          return String(item.id || item.classId || '') === String(student.schoolClass?.id || student.classId || '') ||
            String(item.name || item.className || '').trim().toLowerCase() === String(student.currentClass || student.schoolClass?.name || '').trim().toLowerCase()
        })

        const assignmentBySubject = assignments.reduce((acc, item) => {
          const key = String(item.subjectName || '').trim().toLowerCase()
          if (!key) return acc
          acc[key] = (acc[key] || 0) + 1
          return acc
        }, {})

        const mappedCourses = (transcript.subjectSummaries || []).map((summary, index) => {
          const key = String(summary.subjectName || '').trim().toLowerCase()
          return {
            id: `${summary.subjectName || 'subject'}-${index}`,
            name: summary.subjectName || 'Subject',
            code: String(summary.subjectName || 'SUB').slice(0, 3).toUpperCase(),
            teacher: selectedClass?.classTeacher?.name || selectedClass?.teacherName || 'Assigned Teacher',
            schedule: `${student.currentClass || student.schoolClass?.name || 'Class schedule'} timetable`,
            room: selectedClass?.room?.name || selectedClass?.roomName || selectedClass?.venue || 'TBA',
            credits: Math.max(1, Number(summary.assessmentCount || 1)),
            currentGrade: summary.bestGrade || toLetterGrade(summary.averagePercentage),
            assignmentCount: assignmentBySubject[key] || 0
          }
        })

        setMyCourses(mappedCourses)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [user?.email])

  const columns = [
    { key: 'code', header: 'Course Code', sortable: true },
    { key: 'name', header: 'Course Name', sortable: true },
    { key: 'teacher', header: 'Teacher', sortable: true },
    { key: 'schedule', header: 'Schedule', sortable: false },
    { key: 'room', header: 'Room', sortable: false },
    { key: 'credits', header: 'Credits', sortable: true },
    { key: 'assignmentCount', header: 'Assignments', sortable: true },
    { 
      key: 'currentGrade', 
      header: 'Current Grade', 
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value.startsWith('A') ? 'bg-green-100 text-green-800' :
          value.startsWith('B') ? 'bg-blue-100 text-blue-800' :
          value.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 mt-1">
              {studentLabel
                ? `View ${studentLabel}'s enrolled subjects and current performance`
                : 'View your enrolled subjects and current performance'}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {loading ? '...' : myCourses.length} Courses Enrolled
            </span>
          </div>
        </div>

        <Card>
          <DataTable
            data={myCourses}
            columns={columns}
            searchable
            searchPlaceholder="Search courses..."
          />
          {!loading && myCourses.length === 0 && (
            <div className="mt-4 text-sm text-gray-500">No subjects were found yet. Your courses will appear after assessments or result entries are available.</div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}

export default StudentCourses