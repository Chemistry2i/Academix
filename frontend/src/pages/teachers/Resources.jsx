import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LinkIcon,
  BookmarkIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { useAuth } from '../../contexts/AuthContext'
import { classService } from '../../services/classService'
import subjectService from '../../services/subjectService'
import { teacherResourceService } from '../../services/teacherResourceService'
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
  return date.toLocaleDateString()
}

const Resources = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [myClasses, setMyClasses] = useState([])
  const [subjectNames, setSubjectNames] = useState([])
  const [resources, setResources] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    linkUrl: '',
    className: '',
    subjectName: '',
    resourceType: 'link'
  })

  const classOptions = useMemo(() => {
    const classNames = myClasses
      .map((cls) => cls?.name || cls?.className || '')
      .map((name) => String(name).trim())
      .filter(Boolean)

    return [...new Set(classNames)]
  }, [myClasses])

  const refreshResources = async (className = selectedClass, subjectName = selectedSubject) => {
    const payload = await teacherResourceService.getResources({
      teacherEmail: user?.email,
      className,
      subjectName
    })
    setResources(payload)
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [classPayload, subjectPayload] = await Promise.all([
          classService.getClasses().catch(() => []),
          subjectService.getAllSubjects().catch(() => [])
        ])

        const classes = normalizeArray(classPayload)
        const subjects = normalizeArray(subjectPayload, ['subjects', 'data'])
        const scope = await teacherPortalService.getTeacherContext(user, {
          classes,
          subjects
        })

        const assignedClasses = scope.assignedClasses || []
        const availableSubjects = scope.subjectNames || []

        setMyClasses(assignedClasses)
        setSubjectNames(availableSubjects)
        setForm((current) => ({
          ...current,
          className: current.className || (assignedClasses[0]?.name || assignedClasses[0]?.className || ''),
          subjectName: current.subjectName || (availableSubjects[0] || '')
        }))

        const teacherResources = await teacherResourceService.getResources({ teacherEmail: user?.email })
        setResources(teacherResources)
      } catch (error) {
        console.error('Failed to load teacher resources page:', error)
        setMyClasses([])
        setSubjectNames([])
        setResources([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  useEffect(() => {
    refreshResources(selectedClass, selectedSubject)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, selectedSubject, user?.email])

  const handleSave = async () => {
    if (!form.title.trim() || !form.linkUrl.trim()) {
      toast.error('Add a resource title and link URL')
      return
    }

    try {
      await teacherResourceService.saveResource({
        teacherEmail: user?.email || '',
        teacherName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Teacher',
        title: form.title,
        description: form.description,
        linkUrl: form.linkUrl,
        className: form.className,
        subjectName: form.subjectName,
        resourceType: form.resourceType
      })

      setForm((current) => ({
        ...current,
        title: '',
        description: '',
        linkUrl: ''
      }))
      await refreshResources(selectedClass, selectedSubject)
      toast.success('Resource shared')
    } catch (error) {
      console.error('Failed to save resource:', error)
      toast.error('Failed to share resource')
    }
  }

  const handleDelete = async (resourceId) => {
    try {
      await teacherResourceService.deleteResource(resourceId)
      await refreshResources(selectedClass, selectedSubject)
      toast.success('Resource removed')
    } catch (error) {
      console.error('Failed to delete resource:', error)
      toast.error('Failed to remove resource')
    }
  }

  const handleTogglePin = async (resourceId) => {
    try {
      await teacherResourceService.togglePin(resourceId)
      await refreshResources(selectedClass, selectedSubject)
    } catch (error) {
      console.error('Failed to update resource pin:', error)
      toast.error('Failed to update resource')
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
            <h1 className="text-2xl font-bold text-gray-900">Resource Sharing</h1>
            <p className="text-sm text-gray-600 mt-1">Share links, worksheets, and references for your classes.</p>
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
            <h3 className="text-lg font-semibold text-gray-900">Share New Resource</h3>
            <p className="text-sm text-gray-600">Attach class and subject context so students can find the right material quickly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Resource title"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              value={form.linkUrl}
              onChange={(event) => setForm((current) => ({ ...current, linkUrl: event.target.value }))}
              placeholder="https://"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <textarea
            rows={3}
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Resource description"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3"
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
            <select
              value={form.subjectName}
              onChange={(event) => setForm((current) => ({ ...current, subjectName: event.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All subjects</option>
              {subjectNames.map((subjectName) => (
                <option key={subjectName} value={subjectName}>{subjectName}</option>
              ))}
            </select>
            <select
              value={form.resourceType}
              onChange={(event) => setForm((current) => ({ ...current, resourceType: event.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="link">Link</option>
              <option value="worksheet">Worksheet</option>
              <option value="slides">Slides</option>
              <option value="video">Video</option>
            </select>
            <Button onClick={handleSave} className="w-full">
              <LinkIcon className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filter</h3>
            <p className="text-sm text-gray-600">Narrow by class and subject.</p>
          </div>
          <div className="space-y-3">
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
            <select
              value={selectedSubject}
              onChange={(event) => setSelectedSubject(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All subjects</option>
              {subjectNames.map((subjectName) => (
                <option key={subjectName} value={subjectName}>{subjectName}</option>
              ))}
            </select>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Shared Resources</h3>
          <p className="text-sm text-gray-600">Pinned resources stay on top for quick access.</p>
        </div>

        <div className="space-y-3">
          {resources.map((resource) => (
            <div key={resource.id} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{resource.title}</p>
                  <p className="text-xs text-gray-500">
                    {resource.className || 'All classes'} • {resource.subjectName || 'All subjects'} • {formatDate(resource.createdAt)}
                  </p>
                </div>
                <span className="rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700">
                  {resource.resourceType}
                </span>
              </div>

              {resource.description && (
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{resource.description}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                <a
                  href={resource.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 text-gray-700 rounded hover:bg-gray-50"
                >
                  <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                  Open
                </a>
                <button
                  onClick={() => handleTogglePin(resource.id)}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs border rounded ${
                    resource.isPinned
                      ? 'text-primary-700 border-primary-200 bg-primary-50'
                      : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <BookmarkIcon className="w-3 h-3" />
                  {resource.isPinned ? 'Pinned' : 'Pin'}
                </button>
                <button
                  onClick={() => handleDelete(resource.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-red-200 text-red-700 rounded hover:bg-red-50"
                >
                  <TrashIcon className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}

          {!loading && !resources.length && (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
              No resources found for this filter.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default Resources
