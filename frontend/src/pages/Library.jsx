import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BuildingLibraryIcon,
  PlusIcon,
  BookOpenIcon,
  ArrowPathIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { useLocation } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import { useAuth } from '../contexts/AuthContext'
import { libraryService } from '../services/libraryService'
import toast from 'react-hot-toast'

const Library = () => {
  const location = useLocation()
  const { user, hasAnyRole } = useAuth()
  const isTeacherPortal = location.pathname.startsWith('/teacher')
  const canManageLibrary = !isTeacherPortal && hasAnyRole(['ADMIN'])

  const [loading, setLoading] = useState(true)
  const [books, setBooks] = useState([])
  const [myBorrowedBookIds, setMyBorrowedBookIds] = useState(new Set())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    totalCopies: 1
  })

  const loadLibrary = async () => {
    try {
      setLoading(true)
      const [bookData, myBorrowRecords] = await Promise.all([
        libraryService.getBooks(),
        libraryService.getBorrowRecords({
          borrowerEmail: user?.email,
          activeOnly: true
        })
      ])

      setBooks(bookData)
      setMyBorrowedBookIds(new Set(myBorrowRecords.map((record) => record.bookId)))
    } catch (error) {
      console.error('Failed to load library:', error)
      toast.error('Failed to load library data')
      setBooks([])
      setMyBorrowedBookIds(new Set())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLibrary()
  }, [user?.email])

  const summary = useMemo(() => {
    const totalTitles = books.length
    const totalCopies = books.reduce((sum, book) => sum + Number(book.totalCopies || 0), 0)
    const availableCopies = books.reduce((sum, book) => sum + Number(book.availableCopies || 0), 0)
    return {
      totalTitles,
      totalCopies,
      availableCopies,
      myBorrowed: myBorrowedBookIds.size
    }
  }, [books, myBorrowedBookIds])

  const handleBorrow = async (book) => {
    try {
      await libraryService.borrowBook(book.id, {
        name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Teacher',
        email: user?.email || '',
        role: isTeacherPortal ? 'TEACHER' : 'ADMIN'
      })
      toast.success(`Borrowed "${book.title}"`)
      await loadLibrary()
    } catch (error) {
      toast.error(error?.message || 'Failed to borrow book')
    }
  }

  const handleReturn = async (book) => {
    try {
      await libraryService.returnBook(book.id, user?.email || '')
      toast.success(`Returned "${book.title}"`)
      await loadLibrary()
    } catch (error) {
      toast.error(error?.message || 'Failed to return book')
    }
  }

  const handleDeleteBook = async (book) => {
    try {
      await libraryService.deleteBook(book.id)
      toast.success('Book removed from catalog')
      await loadLibrary()
    } catch (error) {
      toast.error(error?.message || 'Failed to delete book')
    }
  }

  const handleAddBook = async () => {
    if (!bookForm.title.trim() || !bookForm.author.trim()) {
      toast.error('Book title and author are required')
      return
    }

    try {
      await libraryService.addBook(bookForm)
      setBookForm({ title: '', author: '', isbn: '', category: '', totalCopies: 1 })
      setIsAddModalOpen(false)
      toast.success('Book added successfully')
      await loadLibrary()
    } catch (error) {
      toast.error(error?.message || 'Failed to add book')
    }
  }

  const columns = [
    { key: 'title', header: 'Book Title' },
    { key: 'author', header: 'Author' },
    { key: 'category', header: 'Category' },
    {
      key: 'copies',
      header: 'Copies',
      render: (_, row) => (
        <span className="text-sm text-gray-700">
          {row.availableCopies}/{row.totalCopies}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'Available' ? 'bg-green-100 text-green-800' :
          value === 'Unavailable' ? 'bg-red-100 text-red-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, row) => {
        const isBorrowedByMe = myBorrowedBookIds.has(row.id)
        return (
          <div className="flex items-center gap-2">
            {isBorrowedByMe ? (
              <Button size="sm" variant="outline" onClick={() => handleReturn(row)}>
                Return
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleBorrow(row)}
                disabled={row.availableCopies <= 0}
              >
                Borrow
              </Button>
            )}
            {canManageLibrary && (
              <Button size="sm" variant="danger" onClick={() => handleDeleteBook(row)}>
                <TrashIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        )
      }
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isTeacherPortal ? 'Teacher Library' : 'Library Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isTeacherPortal
              ? 'Browse catalog, borrow books, and return your checked-out copies.'
              : 'Manage books, borrowing, and library resources.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadLibrary}>
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {canManageLibrary && (
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsAddModalOpen(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Book
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-xs text-gray-500">Titles</p><p className="text-xl font-bold text-gray-900">{summary.totalTitles}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500">Total Copies</p><p className="text-xl font-bold text-gray-900">{summary.totalCopies}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500">Available Copies</p><p className="text-xl font-bold text-gray-900">{summary.availableCopies}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500">My Borrowed</p><p className="text-xl font-bold text-gray-900">{summary.myBorrowed}</p></Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <BuildingLibraryIcon className="w-5 h-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Book Collection</h3>
          </div>
          <DataTable
            data={books}
            columns={columns}
            searchable
            pagination
          />
          {loading && <p className="text-sm text-gray-500 mt-3">Loading library...</p>}
        </div>
      </Card>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Book</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={bookForm.title} onChange={(e) => setBookForm((c) => ({ ...c, title: e.target.value }))} placeholder="Title" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input value={bookForm.author} onChange={(e) => setBookForm((c) => ({ ...c, author: e.target.value }))} placeholder="Author" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input value={bookForm.isbn} onChange={(e) => setBookForm((c) => ({ ...c, isbn: e.target.value }))} placeholder="ISBN" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input value={bookForm.category} onChange={(e) => setBookForm((c) => ({ ...c, category: e.target.value }))} placeholder="Category" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input type="number" min="1" value={bookForm.totalCopies} onChange={(e) => setBookForm((c) => ({ ...c, totalCopies: Number(e.target.value || 1) }))} placeholder="Copies" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAddBook}>Save Book</Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default Library