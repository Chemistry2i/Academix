import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { DocumentTextIcon, BookmarkIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { useAuth } from '../../contexts/AuthContext'
import { classService } from '../../services/classService'
import { teacherNotesService } from '../../services/teacherNotesService'
import { teacherPortalService } from '../../services/teacherPortalService'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const normalizeArray = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key]
  }

  const firstArray = Object.values(payload).find((value) => Array.isArray(value))
  return firstArray || []
}

const formatDate = (value) => {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return 'Date unavailable'
  return date.toLocaleString()
}

const Notes = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [myClasses, setMyClasses] = useState([])
  const [notes, setNotes] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [form, setForm] = useState({
    title: '',
    content: '',
    className: '',
    priority: 'normal'
  })

  const classOptions = useMemo(() => {
    const classNames = myClasses
      .map((cls) => cls?.name || cls?.className || '')
      .map((name) => String(name).trim())
      .filter(Boolean)

    return [...new Set(classNames)]
  }, [myClasses])

  const refreshNotes = async (className = selectedClass) => {
    const payload = await teacherNotesService.getNotes({
      teacherEmail: user?.email,
      className
    })
    setNotes(payload)
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const classPayload = await classService.getClasses().catch(() => [])
        const classes = normalizeArray(classPayload)
        const scope = await teacherPortalService.getTeacherContext(user, { classes })
        const assignedClasses = scope.assignedClasses || []

        setMyClasses(assignedClasses)
        setForm((current) => ({
          ...current,
          className: current.className || (assignedClasses[0]?.name || assignedClasses[0]?.className || '')
        }))

        const teacherNotes = await teacherNotesService.getNotes({ teacherEmail: user?.email })
        setNotes(teacherNotes)
      } catch (error) {
        console.error('Failed to load teacher notes page:', error)
        setMyClasses([])
        setNotes([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  useEffect(() => {
    refreshNotes(selectedClass)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, user?.email])

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Add a title and note content')
      return
    }

    try {
      await teacherNotesService.saveNote({
        teacherEmail: user?.email || '',
        teacherName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Teacher',
        title: form.title,
        content: form.content,
        className: form.className,
        priority: form.priority
      })

      setForm((current) => ({
        ...current,
        title: '',
        content: ''
      }))
      await refreshNotes(selectedClass)
      toast.success('Note saved')
    } catch (error) {
      console.error('Failed to save note:', error)
      toast.error('Failed to save note')
    }
  }

  const handleDelete = async (noteId) => {
    try {
      await teacherNotesService.deleteNote(noteId)
      await refreshNotes(selectedClass)
      toast.success('Note deleted')
    } catch (error) {
      console.error('Failed to delete note:', error)
      toast.error('Failed to delete note')
    }
  }

  const handleTogglePin = async (noteId) => {
    try {
      await teacherNotesService.togglePin(noteId)
      await refreshNotes(selectedClass)
    } catch (error) {
      console.error('Failed to update note pin:', error)
      toast.error('Failed to update note')
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teacher Notes</h1>
            <p className="text-sm text-gray-600 mt-1">Track interventions, reminders, and action points by class.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/teacher/attendance')}>
            <ClockIcon className="w-4 h-4 mr-2" />
            Take Attendance
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">New Note</h3>
            <p className="text-sm text-gray-600">Save notes so they are easy to revisit during grading and attendance follow-up.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Note title"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <select
              value={form.className}
              onChange={(event) => setForm((current) => ({ ...current, className: event.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All classes</option>
              {classOptions.map((className) => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <textarea
              rows={5}
              value={form.content}
              onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
              placeholder="Write your note"
              className="md:col-span-3 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <div className="space-y-3">
              <select
                value={form.priority}
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
              <Button className="w-full" onClick={handleSave}>
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Save Note
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filter</h3>
            <p className="text-sm text-gray-600">Focus notes by class when needed.</p>
          </div>
          <select
            value={selectedClass}
            onChange={(event) => setSelectedClass(event.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All classes</option>
            {classOptions.map((className) => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>
        </Card>
      </div>

      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Saved Notes</h3>
          <p className="text-sm text-gray-600">Pinned notes always stay at the top.</p>
        </div>

        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                  <p className="text-xs text-gray-500">
                    {note.className || 'All classes'} • {formatDate(note.createdAt)}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                  note.priority === 'urgent'
                    ? 'bg-red-100 text-red-700'
                    : note.priority === 'important'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                }`}>
                  {note.priority}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleTogglePin(note.id)}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs border rounded ${
                    note.isPinned
                      ? 'text-primary-700 border-primary-200 bg-primary-50'
                      : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <BookmarkIcon className="w-3 h-3" />
                  {note.isPinned ? 'Pinned' : 'Pin'}
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-red-200 text-red-700 rounded hover:bg-red-50"
                >
                  <TrashIcon className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}

          {!loading && !notes.length && (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
              No notes found for this filter.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default Notes
