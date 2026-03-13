const NOTES_STORAGE_KEY = 'academix.teacherNotes.v1'

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

const createId = () => `NOTE-${Date.now()}-${Math.floor(Math.random() * 1000)}`

class TeacherNotesService {
  getStoredNotes() {
    return readJson(NOTES_STORAGE_KEY, [])
  }

  setStoredNotes(notes) {
    writeJson(NOTES_STORAGE_KEY, notes)
  }

  async getNotes(filters = {}) {
    const notes = this.getStoredNotes()

    return notes
      .filter((note) => {
        if (filters.teacherEmail && normalizeString(note.teacherEmail) !== normalizeString(filters.teacherEmail)) {
          return false
        }

        if (filters.className && normalizeString(note.className) !== normalizeString(filters.className)) {
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

  async saveNote(payload = {}) {
    const notes = this.getStoredNotes()
    const now = new Date().toISOString()

    const normalized = {
      id: payload.id || createId(),
      teacherEmail: payload.teacherEmail || '',
      teacherName: payload.teacherName || 'Teacher',
      title: payload.title?.trim() || '',
      content: payload.content?.trim() || '',
      className: payload.className?.trim() || '',
      priority: payload.priority || 'normal',
      isPinned: Boolean(payload.isPinned),
      createdAt: payload.createdAt || now,
      updatedAt: now
    }

    const index = notes.findIndex((note) => note.id === normalized.id)
    if (index >= 0) {
      notes[index] = {
        ...notes[index],
        ...normalized,
        createdAt: notes[index].createdAt || normalized.createdAt
      }
    } else {
      notes.unshift(normalized)
    }

    this.setStoredNotes(notes)
    return normalized
  }

  async deleteNote(noteId) {
    const notes = this.getStoredNotes().filter((note) => note.id !== noteId)
    this.setStoredNotes(notes)
    return true
  }

  async togglePin(noteId) {
    const notes = this.getStoredNotes().map((note) => {
      if (note.id !== noteId) return note
      return {
        ...note,
        isPinned: !note.isPinned,
        updatedAt: new Date().toISOString()
      }
    })

    this.setStoredNotes(notes)
    return notes.find((note) => note.id === noteId) || null
  }
}

export const teacherNotesService = new TeacherNotesService()

export default teacherNotesService
