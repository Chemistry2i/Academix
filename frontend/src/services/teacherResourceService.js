const RESOURCE_STORAGE_KEY = 'academix.teacherResources.v1'

const readJson = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (error) {
    console.error(`Failed to read ${key}:`, error)
    return fallback
  }
}

const writeJson = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Failed to write ${key}:`, error)
  }
}

const normalizeString = (value) => String(value || '').trim().toLowerCase()
const createId = () => `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`

class TeacherResourceService {
  getStoredResources() {
    return readJson(RESOURCE_STORAGE_KEY, [])
  }

  setStoredResources(resources) {
    writeJson(RESOURCE_STORAGE_KEY, resources)
  }

  async getResources(filters = {}) {
    const resources = this.getStoredResources()

    return resources
      .filter((resource) => {
        if (filters.teacherEmail && normalizeString(resource.teacherEmail) !== normalizeString(filters.teacherEmail)) {
          return false
        }

        if (filters.className && normalizeString(resource.className) !== normalizeString(filters.className)) {
          return false
        }

        if (filters.subjectName && normalizeString(resource.subjectName) !== normalizeString(filters.subjectName)) {
          return false
        }

        return true
      })
      .sort((left, right) => {
        const leftPinned = left.isPinned ? 1 : 0
        const rightPinned = right.isPinned ? 1 : 0
        if (leftPinned !== rightPinned) return rightPinned - leftPinned
        return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
      })
  }

  async saveResource(payload = {}) {
    const resources = this.getStoredResources()
    const now = new Date().toISOString()

    const normalized = {
      id: payload.id || createId(),
      teacherEmail: payload.teacherEmail || '',
      teacherName: payload.teacherName || 'Teacher',
      title: payload.title?.trim() || '',
      description: payload.description?.trim() || '',
      linkUrl: payload.linkUrl?.trim() || '',
      resourceType: payload.resourceType || 'link',
      className: payload.className?.trim() || '',
      subjectName: payload.subjectName?.trim() || '',
      isPinned: Boolean(payload.isPinned),
      createdAt: payload.createdAt || now,
      updatedAt: now
    }

    const index = resources.findIndex((item) => item.id === normalized.id)
    if (index >= 0) {
      resources[index] = {
        ...resources[index],
        ...normalized,
        createdAt: resources[index].createdAt || normalized.createdAt
      }
    } else {
      resources.unshift(normalized)
    }

    this.setStoredResources(resources)
    return normalized
  }

  async deleteResource(resourceId) {
    const resources = this.getStoredResources().filter((item) => item.id !== resourceId)
    this.setStoredResources(resources)
    return true
  }

  async togglePin(resourceId) {
    const resources = this.getStoredResources().map((item) => {
      if (item.id !== resourceId) return item
      return {
        ...item,
        isPinned: !item.isPinned,
        updatedAt: new Date().toISOString()
      }
    })

    this.setStoredResources(resources)
    return resources.find((item) => item.id === resourceId) || null
  }
}

export const teacherResourceService = new TeacherResourceService()

export default teacherResourceService
