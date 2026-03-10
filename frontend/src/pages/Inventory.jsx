import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CubeIcon, 
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'

const Inventory = () => {
  const [filter, setFilter] = useState('all')
  const [category, setCategory] = useState('all')

  const mockInventory = [
    {
      id: 1,
      itemName: 'Classroom Projectors',
      category: 'Electronics',
      quantity: 15,
      location: 'Electronics Storage',
      condition: 'Good',
      lastChecked: '2026-03-05',
      value: '$450.00',
      status: 'Available'
    },
    {
      id: 2,
      itemName: 'Science Lab Microscopes',
      category: 'Lab Equipment',
      quantity: 8,
      location: 'Science Lab 1',
      condition: 'Excellent',
      lastChecked: '2026-03-08',
      value: '$1,200.00',
      status: 'In Use'
    },
    {
      id: 3,
      itemName: 'Library Books - Fiction',
      category: 'Books',
      quantity: 1250,
      location: 'Main Library',
      condition: 'Good',
      lastChecked: '2026-03-01',
      value: '$25.00',
      status: 'Available'
    },
    {
      id: 4,
      itemName: 'Sports Equipment - Soccer Balls',
      category: 'Sports',
      quantity: 3,
      location: 'Sports Storage',
      condition: 'Poor',
      lastChecked: '2026-03-07',
      value: '$35.00',
      status: 'Needs Replacement'
    },
    {
      id: 5,
      itemName: 'Office Chairs',
      category: 'Furniture',
      quantity: 25,
      location: 'Various Classrooms',
      condition: 'Good',
      lastChecked: '2026-02-28',
      value: '$150.00',
      status: 'Available'
    }
  ]

  const stats = [
    { title: 'Total Items', value: '2,847', change: '+45', trend: 'up' },
    { title: 'Available Items', value: '2,654', change: '+32', trend: 'up' },
    { title: 'Need Replacement', value: '28', change: '+5', trend: 'up' },
    { title: 'Total Value', value: '$458,230', change: '+$12,450', trend: 'up' }
  ]

  const lowStockItems = [
    { name: 'Whiteboard Markers', quantity: 5, threshold: 20 },
    { name: 'Printer Paper', quantity: 12, threshold: 50 },
    { name: 'Art Supplies', quantity: 8, threshold: 25 }
  ]

  const columns = [
    { key: 'itemName', header: 'Item Name' },
    { key: 'category', header: 'Category' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'location', header: 'Location' },
    { 
      key: 'condition', 
      header: 'Condition',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Excellent' ? 'bg-green-100 text-green-800' :
          value === 'Good' ? 'bg-blue-100 text-blue-800' :
          value === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Available' ? 'bg-green-100 text-green-800' :
          value === 'In Use' ? 'bg-blue-100 text-blue-800' :
          value === 'Needs Replacement' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'value', header: 'Unit Value' },
    { key: 'lastChecked', header: 'Last Checked' },
    { 
      key: 'actions', 
      header: 'Actions',
      render: () => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Edit</Button>
          <Button size="sm" variant="ghost">Check</Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Track school equipment, supplies, and resources</p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alert */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
              </div>
              <div className="space-y-3">
                {lowStockItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} remaining (Min: {item.threshold})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Alerts
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <CubeIcon className="h-8 w-8 text-primary-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Add Item</p>
                  <p className="text-sm text-gray-600">Register new equipment</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <CheckCircleIcon className="h-8 w-8 text-primary-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Check Item</p>
                  <p className="text-sm text-gray-600">Update item status</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <ClipboardDocumentListIcon className="h-8 w-8 text-primary-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Audit Report</p>
                  <p className="text-sm text-gray-600">Generate inventory audit</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <ExclamationTriangleIcon className="h-8 w-8 text-orange-600 mb-2 mx-auto" />
                  <p className="font-medium text-gray-900">Maintenance</p>
                  <p className="text-sm text-gray-600">Schedule maintenance</p>
                </motion.button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Inventory Items</h3>
            <div className="flex gap-2">
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="books">Books</option>
                <option value="sports">Sports</option>
                <option value="furniture">Furniture</option>
                <option value="lab">Lab Equipment</option>
              </select>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="maintenance">Needs Maintenance</option>
              </select>
            </div>
          </div>
          <DataTable
            data={mockInventory}
            columns={columns}
            searchPlaceholder="Search inventory items..."
          />
        </div>
      </Card>
    </div>
  )
}

export default Inventory