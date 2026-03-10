import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BuildingLibraryIcon, PlusIcon, BookOpenIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'

const Library = () => {
  const [books] = useState([
    {
      id: 1,
      title: 'Advanced Mathematics',
      author: 'John Smith',
      isbn: '978-0123456789',
      category: 'Mathematics',
      status: 'Available',
      copies: 5
    },
    {
      id: 2,
      title: 'Physics Fundamentals',
      author: 'Jane Doe',
      isbn: '978-0987654321',
      category: 'Physics',
      status: 'Borrowed',
      copies: 3
    },
    {
      id: 3,
      title: 'World History',
      author: 'Robert Johnson',
      isbn: '978-0456789123',
      category: 'History',
      status: 'Available',
      copies: 8
    }
  ])

  const columns = [
    { key: 'title', label: 'Book Title' },
    { key: 'author', label: 'Author' },
    { key: 'category', label: 'Category' },
    { key: 'copies', label: 'Copies' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'Available' ? 'bg-green-100 text-green-800' :
          value === 'Borrowed' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
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
          <h1 className="text-2xl font-bold text-gray-900">Library Management</h1>
          <p className="text-gray-600 mt-1">Manage books, borrowing, and library resources</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Book
        </Button>
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
            searchable={true}
            pagination={true}
          />
        </div>
      </Card>
    </motion.div>
  )
}

export default Library