const LIBRARY_BOOKS_KEY = 'academix.library.books.v1'
const LIBRARY_BORROW_KEY = 'academix.library.borrowRecords.v1'

const DEFAULT_BOOKS = [
  {
    id: 'BK-001',
    title: 'Advanced Mathematics',
    author: 'John Smith',
    isbn: '978-0123456789',
    category: 'Mathematics',
    totalCopies: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: 'BK-002',
    title: 'Physics Fundamentals',
    author: 'Jane Doe',
    isbn: '978-0987654321',
    category: 'Physics',
    totalCopies: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'BK-003',
    title: 'World History',
    author: 'Robert Johnson',
    isbn: '978-0456789123',
    category: 'History',
    totalCopies: 8,
    createdAt: new Date().toISOString()
  }
]

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

const createBookId = () => `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`

class LibraryService {
  getStoredBooks() {
    const books = readJson(LIBRARY_BOOKS_KEY, [])
    if (books.length) return books
    writeJson(LIBRARY_BOOKS_KEY, DEFAULT_BOOKS)
    return DEFAULT_BOOKS
  }

  setStoredBooks(books) {
    writeJson(LIBRARY_BOOKS_KEY, books)
  }

  getStoredBorrowRecords() {
    return readJson(LIBRARY_BORROW_KEY, [])
  }

  setStoredBorrowRecords(records) {
    writeJson(LIBRARY_BORROW_KEY, records)
  }

  getBookBorrowCounts(records = []) {
    return records.reduce((acc, record) => {
      if (!record.returnedAt) {
        acc[record.bookId] = (acc[record.bookId] || 0) + 1
      }
      return acc
    }, {})
  }

  enrichBook(book, records = []) {
    const activeBorrowCount = this.getBookBorrowCounts(records)[book.id] || 0
    const availableCopies = Math.max(Number(book.totalCopies || 0) - activeBorrowCount, 0)

    return {
      ...book,
      availableCopies,
      borrowedCopies: activeBorrowCount,
      status: availableCopies > 0 ? 'Available' : 'Unavailable'
    }
  }

  async getBooks(filters = {}) {
    const books = this.getStoredBooks()
    const records = this.getStoredBorrowRecords()

    return books
      .filter((book) => {
        if (filters.category && normalizeString(book.category) !== normalizeString(filters.category)) return false
        if (filters.query) {
          const query = normalizeString(filters.query)
          const content = [book.title, book.author, book.isbn, book.category].map(normalizeString).join(' ')
          if (!content.includes(query)) return false
        }
        return true
      })
      .map((book) => this.enrichBook(book, records))
      .sort((left, right) => left.title.localeCompare(right.title))
  }

  async addBook(payload = {}) {
    const books = this.getStoredBooks()

    const next = {
      id: payload.id || createBookId(),
      title: payload.title?.trim() || '',
      author: payload.author?.trim() || '',
      isbn: payload.isbn?.trim() || '',
      category: payload.category?.trim() || 'General',
      totalCopies: Math.max(Number(payload.totalCopies || 1), 1),
      createdAt: payload.createdAt || new Date().toISOString()
    }

    books.unshift(next)
    this.setStoredBooks(books)
    return next
  }

  async deleteBook(bookId) {
    const records = this.getStoredBorrowRecords()
    const active = records.some((record) => record.bookId === bookId && !record.returnedAt)
    if (active) {
      throw new Error('Cannot delete a book while copies are still borrowed.')
    }

    const books = this.getStoredBooks().filter((book) => book.id !== bookId)
    this.setStoredBooks(books)
    return true
  }

  async borrowBook(bookId, borrower = {}) {
    const books = this.getStoredBooks()
    const records = this.getStoredBorrowRecords()
    const book = books.find((item) => item.id === bookId)

    if (!book) throw new Error('Book not found.')

    const borrowedByUser = records.some((record) => {
      return record.bookId === bookId && !record.returnedAt && normalizeString(record.borrowerEmail) === normalizeString(borrower.email)
    })
    if (borrowedByUser) {
      throw new Error('You have already borrowed this book.')
    }

    const availableCopies = this.enrichBook(book, records).availableCopies
    if (availableCopies <= 0) {
      throw new Error('No copies are currently available.')
    }

    const record = {
      id: `BR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      bookId,
      borrowerName: borrower.name || 'Teacher',
      borrowerEmail: borrower.email || '',
      borrowerRole: borrower.role || 'TEACHER',
      borrowedAt: new Date().toISOString(),
      returnedAt: null
    }

    records.unshift(record)
    this.setStoredBorrowRecords(records)
    return record
  }

  async returnBook(bookId, borrowerEmail) {
    const records = this.getStoredBorrowRecords()
    const index = records.findIndex((record) => {
      return record.bookId === bookId && !record.returnedAt && normalizeString(record.borrowerEmail) === normalizeString(borrowerEmail)
    })

    if (index < 0) {
      throw new Error('No active borrow record found for this user and book.')
    }

    records[index] = {
      ...records[index],
      returnedAt: new Date().toISOString()
    }

    this.setStoredBorrowRecords(records)
    return records[index]
  }

  async getBorrowRecords(filters = {}) {
    const records = this.getStoredBorrowRecords()
    return records.filter((record) => {
      if (filters.bookId && record.bookId !== filters.bookId) return false
      if (filters.borrowerEmail && normalizeString(record.borrowerEmail) !== normalizeString(filters.borrowerEmail)) return false
      if (filters.activeOnly && Boolean(record.returnedAt)) return false
      return true
    })
  }
}

export const libraryService = new LibraryService()

export default libraryService
